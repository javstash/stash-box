import { FC } from "react";
import { Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import cx from "classnames";

import {
  useScenesWithoutCount,
  SceneSortEnum,
  SortDirectionEnum,
} from "src/graphql";

import SceneCard from "src/components/sceneCard";
import { LoadingIndicator } from "src/components/fragments";
import { ROUTE_SCENES } from "src/constants";

const CLASSNAME = "HomePage";
const CLASSNAME_SCENES = `${CLASSNAME}-scenes`;

const ScenesComponent: FC = () => {
  const { data: sceneData, loading: loadingRecent } = useScenesWithoutCount({
    input: {
      page: 1,
      per_page: 20,
      sort: SceneSortEnum.CREATED_AT,
      direction: SortDirectionEnum.DESC,
    },
  });
  const { data: trendingData, loading: loadingTrending } =
    useScenesWithoutCount({
      input: {
        page: 1,
        per_page: 20,
        sort: SceneSortEnum.TRENDING,
        direction: SortDirectionEnum.DESC,
      },
    });

  if (loadingTrending) return <LoadingIndicator message="Loading..." />;

  const scenes = (sceneData?.queryScenes?.scenes ?? []).map((scene) => (
    <Col key={scene.id}>
      <SceneCard scene={scene} />
    </Col>
  ));
  const trendingScenes = (trendingData?.queryScenes?.scenes ?? []).map(
    (scene) => (
      <Col key={scene.id}>
        <SceneCard scene={scene} />
      </Col>
    ),
  );

  return (
    <div className={cx(CLASSNAME, "mx-4")}>
      {trendingScenes.length > 0 && (
        <>
          <h4>
            <Link to={`${ROUTE_SCENES}?sort=trending`}>Trending scenes</Link>
          </h4>
          <Row className={CLASSNAME_SCENES}>{trendingScenes}</Row>
        </>
      )}
      {!loadingRecent && (
        <>
          <h4>
            <Link to={`${ROUTE_SCENES}?sort=created_at`}>
              Recently added scenes
            </Link>
          </h4>
          <Row className={CLASSNAME_SCENES}>{scenes}</Row>
        </>
      )}
    </div>
  );
};

export default ScenesComponent;
