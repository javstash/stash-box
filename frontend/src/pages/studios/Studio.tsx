import { FC } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Tab, Tabs } from "react-bootstrap";
import { sortBy } from "lodash-es";

import {
  usePendingEditsCount,
  TargetTypeEnum,
  CriterionModifier,
  StudioFragment as Studio,
} from "src/graphql";
import { useCurrentUser } from "src/hooks";
import { EditList, SceneList, URLList } from "src/components/list";
import { StudioPerformers } from "./components";

import {
  getImage,
  createHref,
  studioHref,
  formatPendingEdits,
  getUrlBySite,
} from "src/utils";
import { ROUTE_STUDIO_EDIT, ROUTE_STUDIO_DELETE } from "src/constants/route";
import { FavoriteStar } from "src/components/fragments";

const DEFAULT_TAB = "scenes";

interface Props {
  studio: Studio;
}

const StudioComponent: FC<Props> = ({ studio }) => {
  const { isEditor } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.hash?.slice(1) || DEFAULT_TAB;

  const { data: editData } = usePendingEditsCount({
    type: TargetTypeEnum.STUDIO,
    id: studio.id,
  });
  const pendingEditCount = editData?.queryEdits.count;

  const studioImage = getImage(studio.images, "landscape");

  const subStudios = sortBy(studio.child_studios, (s) =>
    s.name.toLowerCase(),
  ).map((s) => (
    <li key={s.id}>
      <Link to={studioHref(s)}>{s.name}</Link>
    </li>
  ));

  const setTab = (tab: string | null) =>
    navigate({ hash: tab === DEFAULT_TAB ? "" : `#${tab}` });

  const homeURL = getUrlBySite(studio.urls, "Home");

  return (
    <>
      <div className="d-flex">
        <div className="studio-title me-auto">
          <h3>
            {studio.deleted ? (
              <del>{studio.name}</del>
            ) : (
              <span>{studio.name}</span>
            )}
            <FavoriteStar
              entity={studio}
              entityType="studio"
              interactable
              className="ps-2"
            />
          </h3>
          {homeURL && (
            <h6>
              {homeURL.site.name !== "Home" && (
                <b className="me-2">{homeURL.site.name}:</b>
              )}
              <a href={homeURL.url} target="_blank" rel="noreferrer noopener">
                {homeURL.url}
              </a>
            </h6>
          )}
          {studio.parent && (
            <span>
              Part of{" "}
              <b>
                <Link to={studioHref(studio.parent)}>{studio.parent.name}</Link>
              </b>
            </span>
          )}
          {studio.aliases.length > 0 && (
            <div className="d-flex">
              <b className="me-2">Aliases:</b>
              <span>{studio.aliases.join(", ")}</span>
            </div>
          )}
        </div>
        {studioImage && (
          <div className="studio-photo">
            <img src={getImage(studio.images, "landscape")} alt="Studio logo" />
          </div>
        )}
        <div>
          {isEditor && !studio.deleted && (
            <>
              <Link to={createHref(ROUTE_STUDIO_EDIT, studio)} className="ms-2">
                <Button>Edit</Button>
              </Link>
              <Link
                to={createHref(ROUTE_STUDIO_DELETE, studio)}
                className="ms-2"
              >
                <Button variant="danger">Delete</Button>
              </Link>
            </>
          )}
        </div>
      </div>
      {subStudios.length > 0 && (
        <>
          <h6>Sub Studios</h6>
          <div className="sub-studio-list">
            <ul>{subStudios}</ul>
          </div>
        </>
      )}
      <Tabs
        activeKey={activeTab}
        id="studio-tabs"
        mountOnEnter
        onSelect={setTab}
      >
        <Tab
          eventKey="scenes"
          title={subStudios.length > 0 ? "All Scenes" : "Scenes"}
        >
          <SceneList
            filter={{ parentStudio: studio.id }}
            favoriteFilter="performer"
          />
        </Tab>
        {subStudios.length > 0 && (
          <Tab eventKey="studio-scenes" title="Studio Scenes">
            <SceneList
              filter={{
                studios: {
                  value: [studio.id],
                  modifier: CriterionModifier.INCLUDES,
                },
              }}
            />
          </Tab>
        )}
        <Tab eventKey="performers" title="Performers">
          <StudioPerformers id={studio.id} />
        </Tab>
        <Tab eventKey="links" title="Links">
          <URLList urls={studio.urls} />
        </Tab>
        <Tab
          eventKey="edits"
          title={`Edits${formatPendingEdits(pendingEditCount)}`}
          tabClassName={pendingEditCount ? "PendingEditTab" : ""}
        >
          <EditList type={TargetTypeEnum.STUDIO} id={studio.id} />
        </Tab>
      </Tabs>
    </>
  );
};

export default StudioComponent;
