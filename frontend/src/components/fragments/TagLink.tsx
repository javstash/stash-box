import { faXmark } from "@fortawesome/free-solid-svg-icons";
import cx from "classnames";
import type { FC } from "react";
import { Badge, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Icon } from "src/components/fragments";

interface IProps {
  title: string;
  link?: string;
  description?: string | null;
  className?: string;
  onRemove?: () => void;
  disabled?: boolean;
}

const dangerTags = [
  "/tags/b1775b2b-666a-4cfa-a441-233d6c65c48a",
  "/tags/bb9fd71c-86d4-428b-ad57-366a895d63f9"
];

const warnTags = [
  "/tags/a7736059-20bc-402e-a9d1-389240c5ed65",
  "/tags/bbb2b3af-7b67-4722-a71d-f93b0955875c",
  "/tags/f24dc5fe-c3d7-4590-b38c-572dc8278fee",
  "/tags/1b0b8252-2817-4117-95b5-1bad0fbb2f51",
  "/tags/a41c429a-4964-4548-8dfd-57bf9777b749",
  "/tags/da4f519c-53a9-4e23-8ca5-12b9d6a964a6",
  "/tags/d9782b04-149b-4774-9e34-1357e9b07a81",
  "/tags/01a0e1e6-5dd0-7938-8e35-84c27e375800"
];

const TagLink: FC<IProps> = ({
  title,
  link,
  description,
  className,
  onRemove,
  disabled = false,
}) => {
  // Determine the bg value based on whether the link is in the special list
  const bgColor = link && dangerTags.includes(link) ? "danger" : warnTags.includes(link) ? "warning" : "none";

  return (
    <Badge className={cx("tag-item", className)} bg={bgColor}>
      <abbr title={description || undefined}>
        {link && !disabled ? <Link to={link}>{title}</Link> : title}
      </abbr>
      {onRemove && (
        <Button onClick={onRemove}>
          <Icon icon={faXmark} />
        </Button>
      )}
    </Badge>
  );
};

export default TagLink;

