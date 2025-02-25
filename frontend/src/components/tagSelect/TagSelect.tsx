import { FC, useState } from "react";
import Async from "react-select/async";
import { OnChangeValue, MenuPlacement } from "react-select";
import { useApolloClient } from "@apollo/client";
import debounce from "p-debounce";

import SearchTagsGQL from "src/graphql/queries/SearchTags.gql";

import { SearchTagsQuery, SearchTagsQueryVariables } from "src/graphql";
import { TagLink } from "src/components/fragments";
import { tagHref } from "src/utils/route";
import { compareByName } from "src/utils";

type Tag = NonNullable<SearchTagsQuery["query"][number]>;

type TagSlim = {
  id: string;
  name: string;
  description?: string | null | undefined;
  aliases: string[];
};

interface TagSelectProps {
  tags?: TagSlim[];
  onChange: (tags: TagSlim[]) => void;
  message?: string;
  excludeTags?: string[];
  menuPlacement?: MenuPlacement;
  allowDeleted?: boolean;
}

interface SearchResult {
  value: Tag;
  label: string;
  sublabel: string;
}

const CLASSNAME = "TagSelect";
const CLASSNAME_LIST = `${CLASSNAME}-list`;
const CLASSNAME_SELECT = `${CLASSNAME}-select`;
const CLASSNAME_CONTAINER = `${CLASSNAME}-container`;

const TagSelect: FC<TagSelectProps> = ({
  tags: initialTags = [],
  onChange,
  message = "Add tag:",
  excludeTags = [],
  menuPlacement = "auto",
  allowDeleted = false,
}) => {
  const client = useApolloClient();
  const [tags, setTags] = useState(initialTags);
  const excluded = [...excludeTags, ...tags.map((t) => t.id)];

  const handleChange = (result: OnChangeValue<SearchResult, false>) => {
    if (result?.value) {
      const newTags = [...tags, result.value];
      setTags(newTags);
      onChange(newTags);
    }
  };

  const removeTag = (id: string) => {
    const newTags = tags.filter((tag) => tag.id !== id);
    setTags(newTags);
    onChange(newTags);
  };

  const tagList = [...(tags ?? [])]
    .sort(compareByName)
    .map((tag) => (
      <TagLink
        title={tag.name}
        description={tag.description}
        link={tagHref(tag)}
        onRemove={() => removeTag(tag.id)}
        key={tag.id}
        disabled
      />
    ));

  const handleSearch = async (term: string) => {
    const { data } = await client.query<
      SearchTagsQuery,
      SearchTagsQueryVariables
    >({
      query: SearchTagsGQL,
      variables: {
        term,
        limit: 25,
      },
    });

    const { exact, query } = data;

    const exactResult =
      exact && !excluded.includes(exact.id) && (allowDeleted || !exact.deleted)
        ? {
            label: exact.name,
            value: exact,
            sublabel: exact.description ?? "",
          }
        : undefined;

    const queryResult = query
      .filter(
        (tag) =>
          !excluded.includes(tag.id) &&
          (allowDeleted || !tag.deleted) &&
          tag.id !== exact?.id,
      )
      .map((tag) => ({
        label: tag.name,
        value: tag,
        sublabel: tag.description ?? "",
      }));

    return [
      ...(exactResult
        ? [
            {
              label:
                exactResult.label.toLowerCase() === term.toLowerCase()
                  ? "Exact Match"
                  : "Alias Match",
              options: [exactResult],
            },
          ]
        : []),
      ...(queryResult ? [{ label: "Tags", options: queryResult }] : []),
    ];
  };

  const debouncedLoadOptions = debounce(handleSearch, 400);

  const formatOptionLabel = ({ label, sublabel, value }: SearchResult) => {
    return (
      <div title={value.aliases.map((a) => `\u{2022} ${a}`).join("\n")}>
        <div className={`${CLASSNAME_SELECT}-value`}>
          {value.deleted ? <del>{label}</del> : label}
        </div>
        <div className={`${CLASSNAME_SELECT}-subvalue`}>{sublabel}</div>
      </div>
    );
  };

  return (
    <div className={CLASSNAME}>
      <div className={CLASSNAME_LIST}>{tagList}</div>
      <div className={CLASSNAME_CONTAINER}>
        <span>{message}</span>
        <Async
          classNamePrefix="react-select"
          className={`react-select ${CLASSNAME_SELECT}`}
          onChange={handleChange}
          loadOptions={debouncedLoadOptions}
          placeholder="Search for tag"
          noOptionsMessage={({ inputValue }) =>
            inputValue === "" ? null : `No tags found for "${inputValue}"`
          }
          menuPlacement={menuPlacement}
          controlShouldRenderValue={false}
          formatOptionLabel={formatOptionLabel}
        />
      </div>
    </div>
  );
};

export default TagSelect;
