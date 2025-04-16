import { FC } from "react";
import { Button } from "react-bootstrap";
import { FingerprintAlgorithm } from "src/graphql";
import { Icon } from "src/components/fragments";
import { formatDuration } from "src/utils";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FingerprintPart } from "src/pages/scenes/components/fingerprintPart";

interface Props {
  scene_id: string;
  fingerprint: {
    id: number;
    hash: string;
    duration: number;
    algorithm: FingerprintAlgorithm;
    part?: number | null;
  };
  deleteFingerprint: () => void;
}

export const UserFingerprint: FC<Props> = ({
  scene_id,
  fingerprint,
  deleteFingerprint,
}) => (
  <li>
    <div key={fingerprint.hash}>
      <Button
        className="text-danger ms-2"
        title="Submitted by you - click to remove submission"
        onClick={deleteFingerprint}
        variant="link"
      >
        <Icon icon={faTimesCircle} />
      </Button>
      <b className="me-2">{fingerprint.algorithm}</b>
      {fingerprint.hash} ({formatDuration(fingerprint.duration)})
      <span className="ms-2">
        <FingerprintPart
          sceneId={scene_id}
          fingerprintId={fingerprint.id}
          userPartSet={fingerprint.part !== null}
        />
        {fingerprint.part !== null && `Part: ${fingerprint.part}`}
      </span>
    </div>
  </li>
);
