import {
  OldSceneDetails,
  SceneDetails,
} from "src/components/editCard/ModifyEdit";

import { SceneFragment } from "src/graphql";
import {
  genderEnum,
  parseDuration,
  diffArray,
  diffValue,
  diffImages,
  diffURLs,
} from "src/utils";

import { SceneFormData } from "./schema";

type OmittedKeys = "draft_id" | "added_fingerprints" | "removed_fingerprints";

type Performer = {
  performer: Pick<
    SceneFragment["performers"][number]["performer"],
    "id" | "name" | "gender" | "disambiguation" | "deleted"
  >;
  as?: string | null;
};

type Tag = {
  id: string;
  name: string;
  description?: string | null;
};

const selectSceneDetails = (
  data: SceneFormData,
  original: SceneFragment | null | undefined,
): [Required<OldSceneDetails>, Required<Omit<SceneDetails, OmittedKeys>>] => {
  const [addedPerformers, removedPerformers] = diffArray<Performer>(
    (data.performers ?? []).flatMap((p) =>
      p.performerId && p.name
        ? [
            {
              performer: {
                id: p.performerId,
                name: p.name,
                gender: genderEnum(p.gender),
                disambiguation: p.disambiguation ?? null,
                deleted: p.deleted ?? false,
              },
              as: p.alias ?? null,
            },
          ]
        : [],
    ),
    original?.performers ?? [],
    (s) => `${s.performer.id}${s.as}`,
  );

  const [addedTags, removedTags] = diffArray<Tag>(
    (data.tags ?? []).flatMap((t) =>
      t.id && t.name
        ? [
            {
              id: t.id,
              name: t.name,
              description: t.description ?? null,
            },
          ]
        : [],
    ),
    original?.tags ?? [],
    (t) => t.id,
  );

  const [addedImages, removedImages] = diffImages(
    data.images,
    original?.images ?? [],
  );
  const [addedUrls, removedUrls] = diffURLs(data.urls, original?.urls ?? []);

  return [
    {
      title: diffValue(original?.title, data.title),
      details: diffValue(original?.details, data.details),
      date: diffValue(original?.release_date, data.date),
      production_date: diffValue(
        original?.production_date,
        data.production_date,
      ),
      duration: diffValue(original?.duration, parseDuration(data.duration)),
      director: diffValue(original?.director, data.director),
      code: diffValue(original?.code, data.code),
      studio:
        original?.studio?.id !== data.studio?.id &&
        original?.studio?.id &&
        original?.studio.name
          ? {
              id: original.studio.id,
              name: original.studio.name,
            }
          : null,
    },
    {
      title: diffValue(data.title, original?.title),
      details: diffValue(data.details, original?.details),
      date: diffValue(data.date, original?.release_date),
      production_date: diffValue(
        data.production_date,
        original?.production_date,
      ),
      duration: diffValue(parseDuration(data.duration), original?.duration),
      director: diffValue(data.director, original?.director),
      code: diffValue(data.code, original?.code),
      studio:
        data.studio?.id !== original?.studio?.id &&
        data.studio?.id &&
        data.studio?.name
          ? {
              id: data.studio.id,
              name: data.studio.name,
            }
          : null,
      added_urls: addedUrls,
      removed_urls: removedUrls,
      added_performers: addedPerformers,
      removed_performers: removedPerformers,
      added_tags: addedTags,
      removed_tags: removedTags,
      added_images: addedImages,
      removed_images: removedImages,
    },
  ];
};

export default selectSceneDetails;
