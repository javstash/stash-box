import { FC } from "react";
import { Link } from "react-router-dom";
import { Card } from "react-bootstrap";
import { faVideo } from "@fortawesome/free-solid-svg-icons";

import { Scene, Studio } from "src/graphql";
import {
  getImage,
  sceneHref,
  performerHref,
  studioHref,
  formatDuration,
  imageType,
} from "src/utils";
import {
  Icon,
  Thumbnail,
  SceneCardPerformerName,
} from "src/components/fragments";

type Performance = Pick<
  Scene, | "id" | "title" | "images" | "duration" | "code" | "release_date" | "performers"
> & {
  studio?: Pick<Studio, "id" | "name"> | null;
};

const CLASSNAME = "SceneCard";
const CLASSNAME_IMAGE = `${CLASSNAME}-image`;
const CLASSNAME_BODY = `${CLASSNAME}-body`;

const SceneCard: FC<{ scene: Performance }> = ({ scene }) => {
  const performers = scene.performers
    .map((performance) => {
      const { performer } = performance;
      return (
        <Link
          key={performer.id}
          to={performerHref(performer)}
          className="scene-performer"
        >
          <SceneCardPerformerName performer={performer} />
        </Link>
      );
    })
    .map((p, index) => (index % 2 === 2 ? [" ", p] : p));

  return (
    <Card className={CLASSNAME}>
      <Card.Body className={CLASSNAME_BODY}>
        <Link className={CLASSNAME_IMAGE} to={sceneHref(scene)}>
          <Thumbnail
            alt={scene.title}
            className={imageType(scene.images[0])}
            image={getImage(scene.images, "landscape")}
            size={300}
          />
        </Link>
      </Card.Body>
      <Card.Footer>
        <div className="d-flex">
          <Link
            className="text-truncate w-100"
            to={sceneHref(scene)}
            title={scene.title ?? ""}
          >
            <h6 className="text-truncate">{scene.title}</h6>
          </Link>
        </div>
        <div className="text-truncate w-100 scene-performers me-auto">
          <strong>{performers}</strong>
        </div>
        <div className="text-muted">
          <Link className="text-truncate w-100" to={sceneHref(scene)}>
            <strong>{scene.code}</strong>
          </Link>
          {scene.studio && (
            <Link
              to={studioHref(scene.studio)}
              className="float-end text-truncate SceneCard-studio-name"
            >
              <Icon icon={faVideo} className="me-1" />
              {scene.studio.name}
            </Link>
          )}
        </div>
        <div className="text-muted">
          <strong>{scene.release_date}</strong>
          <span className="text-muted float-end">
            {scene.duration ? formatDuration(scene.duration) : ""}
          </span>
        </div>
      </Card.Footer>
    </Card>
  );
};
export default SceneCard;
