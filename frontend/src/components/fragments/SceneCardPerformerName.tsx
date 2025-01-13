import { FC } from "react";
import { PerformerFragment } from "src/graphql";

interface PerformerNameProps {
  performer: Pick<PerformerFragment, "name" | "disambiguation" | "deleted">;
}

const SceneCardPerformerName: FC<PerformerNameProps> = ({ performer }) => {
  return (
    <>
      {performer.deleted ? (
        <del>{performer.name}</del>
      ) : (
        <span>{performer.name}</span>
      )}
    </>
  );
};

export default SceneCardPerformerName;
