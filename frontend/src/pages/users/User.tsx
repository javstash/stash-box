import { FC, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Col, Form, InputGroup, Row, Table } from "react-bootstrap";
import {
  faMinus,
  faPlus,
  faSyncAlt,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { sortBy } from "lodash-es";

import {
  VoteStatusEnum,
  VoteTypeEnum,
  useConfig,
  useDeleteUser,
  useRegenerateAPIKey,
  useRescindInviteCode,
  useGrantInvite,
  useRevokeInvite,
  UserQuery,
  PublicUserQuery,
  useGenerateInviteCodes,
  GenerateInviteCodeInput,
  useRequestChangeEmail,
} from "src/graphql";
import { useCurrentUser, useToast } from "src/hooks";
import {
  ROUTE_USER_EDIT,
  ROUTE_USER_PASSWORD,
  ROUTE_USERS,
  ROUTE_USER_EDITS,
  ROUTE_USER_MY_FINGERPRINTS,
} from "src/constants/route";
import Modal from "src/components/modal";
import { Icon, Tooltip } from "src/components/fragments";
import { isPrivateUser, createHref, formatDateTime } from "src/utils";
import { EditStatusTypes, VoteTypes } from "src/constants";
import { GenerateInviteKeyModal } from "./GenerateInviteKeyModal";
import { isApolloError } from "@apollo/client";

interface IInviteKeys {
  id: string;
  uses?: number | null | undefined;
  expires?: string | null | undefined;
}

interface UserInviteKeysProps {
  inviteCodes: IInviteKeys[];
  rescindInvite: (id: string) => void;
}

const UserInviteKeys: FC<UserInviteKeysProps> = ({
  inviteCodes,
  rescindInvite,
}) => {
  if (inviteCodes.length === 0) return <></>;

  return (
    <Table>
      <thead>
        <tr>
          <th>Code</th>
          <th>Uses</th>
          <th>Expires</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {inviteCodes.map((ic) => (
          <tr key={ic.id}>
            <td>
              <InputGroup className="mb-2">
                <InputGroup.Text>
                  <code>{ic.id}</code>
                </InputGroup.Text>
                <Button onClick={() => navigator.clipboard?.writeText(ic.id)}>
                  Copy
                </Button>
              </InputGroup>
            </td>
            <td>{(ic.uses ?? 0) == 0 ? "unlimited" : ic.uses}</td>
            <td>
              {ic.expires ? (
                <span>{formatDateTime(ic.expires, true)}</span>
              ) : (
                "never"
              )}
            </td>
            <td>
              <Button variant="danger" onClick={() => rescindInvite(ic.id)}>
                <Icon icon={faTrash} />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

type User = NonNullable<UserQuery["findUser"]>;
type EditCounts = User["edit_count"];
type VoteCounts = User["vote_count"];

type PublicUser = NonNullable<PublicUserQuery["findUser"]>;

type EditCount = [VoteStatusEnum, number];
const filterEdits = (editCount: EditCounts): EditCount[] => {
  const edits = Object.entries(editCount)
    .map(([status, count]) => {
      const resolvedStatus =
        VoteStatusEnum[status.toUpperCase() as VoteStatusEnum];
      return resolvedStatus
        ? [EditStatusTypes[resolvedStatus], count]
        : undefined;
    })
    .filter((val): val is EditCount => val !== undefined);
  return sortBy(edits, (value) => value[0]);
};

type VoteCount = [VoteTypeEnum, number];
const filterVotes = (voteCount: VoteCounts): VoteCount[] => {
  const votes = Object.entries(voteCount)
    .map(([status, count]) => {
      const resolvedStatus = VoteTypeEnum[status.toUpperCase() as VoteTypeEnum];
      return resolvedStatus ? [VoteTypes[resolvedStatus], count] : undefined;
    })
    .filter((val): val is VoteCount => val !== undefined);
  return sortBy(votes, (value) => value[0]);
};

interface Props {
  user: User | PublicUser;
  refetch: () => void;
}

const UserComponent: FC<Props> = ({ user, refetch }) => {
  const { isAdmin, isSelf } = useCurrentUser();
  const { data: configData } = useConfig();
  const [showDelete, setShowDelete] = useState(false);
  const [showRegenerateAPIKey, setShowRegenerateAPIKey] = useState(false);
  const [showRescindCode, setShowRescindCode] = useState<string | undefined>();
  const [showGenerateInviteKey, setShowGenerateInviteKey] = useState(false);
  const toast = useToast();

  const [deleteUser, { loading: deleting }] = useDeleteUser();
  const [regenerateAPIKey] = useRegenerateAPIKey();
  const [rescindInviteCode] = useRescindInviteCode();
  const [generateInviteCode] = useGenerateInviteCodes();
  const [grantInvite] = useGrantInvite();
  const [revokeInvite] = useRevokeInvite();
  const [requestChangeEmail] = useRequestChangeEmail();

  const showPrivate = isPrivateUser(user);
  const isOwner = showPrivate && isSelf(user);

  const endpointURL = configData && `${configData.getConfig.host_url}/graphql`;

  const toggleModal = () => setShowDelete(true);
  const handleDelete = (status: boolean): void => {
    if (status)
      deleteUser({ variables: { input: { id: user.id } } }).then(() => {
        window.location.href = ROUTE_USERS;
      });
    setShowDelete(false);
  };
  const deleteModal = showDelete && (
    <Modal
      message={`Are you sure you want to delete '${user.name}'? This operation cannot be undone.`}
      callback={handleDelete}
    />
  );

  const handleRegenerateAPIKey = (status: boolean): void => {
    if (status) {
      const userID = isSelf(user.id) ? null : user.id;
      regenerateAPIKey({ variables: { user_id: userID } }).then(() => {
        refetch();
      });
    }
    setShowRegenerateAPIKey(false);
  };
  const regenerateAPIKeyModal = showRegenerateAPIKey && (
    <Modal callback={handleRegenerateAPIKey} acceptTerm="Confirm">
      <>
        <p>
          Are you sure you want to regenerate the API key? The old key will be
          removed and can no longer be used.
        </p>
        <p>
          <i>This operation cannot be undone.</i>
        </p>
      </>
    </Modal>
  );

  const handleRescindCode = (status: boolean): void => {
    if (status) {
      rescindInviteCode({ variables: { code: showRescindCode ?? "" } }).then(
        () => {
          refetch();
        },
      );
    }

    setShowRescindCode(undefined);
  };
  const rescindCodeModal = showRescindCode && (
    <Modal
      message={`Are you sure you want to rescind code '${showRescindCode}'? This operation cannot be undone.`}
      callback={handleRescindCode}
    />
  );

  const handleGenerateCode = (input: GenerateInviteCodeInput) => {
    generateInviteCode({
      variables: {
        input,
      },
    }).then(() => {
      refetch();
    });
  };

  const generateInviteCodeModal = showGenerateInviteKey && (
    <GenerateInviteKeyModal
      callback={(i) => {
        if (i) {
          handleGenerateCode(i);
        }
        setShowGenerateInviteKey(false);
      }}
    />
  );

  const handleGrantInvite = () => {
    grantInvite({
      variables: {
        input: {
          amount: 1,
          user_id: user.id,
        },
      },
    }).then(() => {
      refetch();
    });
  };

  const handleRevokeInvite = () => {
    revokeInvite({
      variables: {
        input: {
          amount: 1,
          user_id: user.id,
        },
      },
    }).then(() => {
      refetch();
    });
  };

  const handleChangeEmail = () => {
    requestChangeEmail()
      .then(() => {
        toast({
          variant: "success",
          content: (
            <>
              <h5>Change email</h5>
              <div>Please check your existing email to continue.</div>
            </>
          ),
        });
      })
      .catch((error: unknown) => {
        let message: React.ReactNode | string | undefined =
          error instanceof Error && isApolloError(error) && error.message;
        if (message === "pending-email-change")
          message = (
            <>
              <h5>Pending email change</h5>
              <div>Email change already requested. Please try again later.</div>
            </>
          );
        toast({ variant: "danger", content: message });
      });
  };

  const editCount = filterEdits(user.edit_count);
  const voteCount = filterVotes(user.vote_count);

  return (
    <Row className="justify-content-center">
      <Col lg={10}>
        <div className="d-flex">
          <h3>{user.name}</h3>
          {deleteModal}
          {regenerateAPIKeyModal}
          {generateInviteCodeModal}
          {rescindCodeModal}
          <div className="ms-auto">
            <Link to={createHref(ROUTE_USER_EDITS, user)} className="ms-2">
              <Button variant="secondary">User Edits</Button>
            </Link>
            {isOwner && (
              <>
                <Link to={ROUTE_USER_MY_FINGERPRINTS} className="ms-2">
                  <Button variant="secondary">My Fingerprints</Button>
                </Link>
                <Link to={ROUTE_USER_PASSWORD} className="ms-2">
                  <Button>Change Password</Button>
                </Link>
              </>
            )}
            {isOwner && (
              <Button onClick={() => handleChangeEmail()} className="ms-2">
                Change Email
              </Button>
            )}
            {isAdmin && (
              <>
                <Link to={createHref(ROUTE_USER_EDIT, user)} className="ms-2">
                  <Button>Edit User</Button>
                </Link>
                <Button
                  className="ms-2"
                  variant="danger"
                  disabled={showDelete || deleting}
                  onClick={toggleModal}
                >
                  Delete User
                </Button>
              </>
            )}
          </div>
        </div>
        <hr />
        {showPrivate && (
          <>
            <Row>
              <Col xs={2}>Email</Col>
              <Col>{user.email}</Col>
            </Row>
            <Row>
              <Col xs={2}>Roles</Col>
              <Col>{(user.roles ?? []).join(", ")}</Col>
            </Row>
            <Row className="my-3 align-items-baseline">
              <Col xs={2}>API key</Col>
              <Col xs={10}>
                <InputGroup>
                  <Form.Control value={user.api_key ?? ""} disabled />
                  <Button
                    onClick={() =>
                      navigator.clipboard?.writeText(user.api_key ?? "")
                    }
                  >
                    Copy to Clipboard
                  </Button>
                  <Tooltip text="Regenerate API Key" placement="top-end">
                    <Button
                      variant="danger"
                      disabled={showRegenerateAPIKey}
                      onClick={() => setShowRegenerateAPIKey(true)}
                    >
                      <Icon icon={faSyncAlt} />
                    </Button>
                  </Tooltip>
                </InputGroup>
              </Col>
            </Row>
            {endpointURL && (
              <Row className="my-3 align-items-baseline">
                <Col xs={2}>GraphQL Endpoint</Col>
                <Col xs={10}>
                  <InputGroup>
                    <Form.Control value={endpointURL} disabled />
                    <Button
                      onClick={() =>
                        navigator.clipboard?.writeText(endpointURL)
                      }
                    >
                      Copy to Clipboard
                    </Button>
                  </InputGroup>
                </Col>
              </Row>
            )}
          </>
        )}
        <>
          <Row>
            <Col xs={6}>
              <Table>
                <thead>
                  <tr>
                    <th>Edits</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {editCount.map(([status, count]) => (
                    <tr key={status}>
                      <td>{status}</td>
                      <td>{count}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
            <Col xs={6}>
              <Table>
                <thead>
                  <tr>
                    <th>Votes</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {voteCount.map(([vote, count]) => (
                    <tr key={vote}>
                      <td>{vote}</td>
                      <td>{count}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>
          {showPrivate && (
            <Row>
              <Col xs={2}>Invite Tokens</Col>
              <InputGroup className="col">
                {isAdmin && (
                  <Button onClick={() => handleRevokeInvite()}>
                    <Icon icon={faMinus} />
                  </Button>
                )}
                <InputGroup.Text>{user.invite_tokens ?? 0}</InputGroup.Text>
                {isAdmin && (
                  <Button onClick={() => handleGrantInvite()}>
                    <Icon icon={faPlus} />
                  </Button>
                )}
              </InputGroup>
            </Row>
          )}
          {showPrivate && (
            <div>
              <Row>
                <Col xs={2}>Invite Keys</Col>
              </Row>
              <Row className="my-2">
                <Col>
                  <div>
                    {isOwner && (
                      <Button
                        variant="link"
                        onClick={() => setShowGenerateInviteKey(true)}
                        disabled={user.invite_tokens === 0}
                      >
                        <Icon icon={faPlus} className="me-2" />
                        Generate Key
                      </Button>
                    )}
                  </div>
                  <UserInviteKeys
                    inviteCodes={user.invite_codes ?? []}
                    rescindInvite={(c) => setShowRescindCode(c)}
                  />
                </Col>
              </Row>
            </div>
          )}
        </>
      </Col>
    </Row>
  );
};

export default UserComponent;
