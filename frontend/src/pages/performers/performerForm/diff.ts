import {
  OldPerformerDetails,
  PerformerDetails,
} from "src/components/editCard/ModifyEdit";

import { PerformerFragment } from "src/graphql";
import {
  breastType,
  ethnicityEnum,
  genderEnum,
  diffArray,
  diffValue,
  diffImages,
  diffURLs,
  parseBraSize,
} from "src/utils";

import { PerformerFormData } from "./schema";

const diffBodyMods = (
  newMods: { location?: string; description?: string | null }[] | undefined,
  oldMods: { location: string; description?: string | null }[] | null,
) =>
  diffArray(
    (newMods ?? []).flatMap((m) =>
      m.location
        ? [
            {
              location: m.location,
              description: m.description ?? null,
            },
          ]
        : [],
    ),
    oldMods ?? [],
    (mod) => `${mod.location}|${mod.description}`,
  );

const selectPerformerDetails = (
  data: PerformerFormData,
  original: PerformerFragment | null | undefined,
): [
  Required<OldPerformerDetails>,
  Required<Omit<PerformerDetails, "draft_id">>,
] => {
  const [addedImages, removedImages] = diffImages(
    data.images,
    original?.images ?? [],
  );
  const [addedUrls, removedUrls] = diffURLs(data.urls, original?.urls ?? []);
  const [addedTattoos, removedTattoos] = diffBodyMods(
    data.tattoos,
    original?.tattoos ?? [],
  );
  const [addedPiercings, removedPiercings] = diffBodyMods(
    data.piercings,
    original?.piercings ?? [],
  );
  const [addedAliases, removedAliases] = diffArray(
    data.aliases,
    original?.aliases ?? [],
    (a) => a,
  );
  const [newCupSize, newBandSize] = parseBraSize(data.braSize ?? "");

  return [
    {
      name: diffValue(original?.name, data.name),
      disambiguation: diffValue(original?.disambiguation, data.disambiguation),
      gender: diffValue(original?.gender, genderEnum(data.gender)),
      birthdate: diffValue(original?.birth_date, data.birthdate),
      deathdate: diffValue(original?.death_date, data.deathdate),
      career_start_year: diffValue(
        original?.career_start_year,
        data.career_start_year,
      ),
      career_end_year: diffValue(
        original?.career_end_year,
        data.career_end_year,
      ),
      height: diffValue(original?.height, data.height),
      band_size: diffValue(original?.band_size, newBandSize),
      cup_size: diffValue(original?.cup_size, newCupSize),
      waist_size: diffValue(original?.waist_size, data.waistSize),
      hip_size: diffValue(original?.hip_size, data.hipSize),
      breast_type: diffValue(
        original?.breast_type,
        breastType(data.breastType),
      ),
      country: diffValue(original?.country, data.country),
      ethnicity: diffValue(original?.ethnicity, ethnicityEnum(data.ethnicity)),
      eye_color: diffValue(original?.eye_color, data.eye_color),
      hair_color: diffValue(original?.hair_color, data.hair_color),
    },
    {
      name: diffValue(data.name, original?.name),
      disambiguation: diffValue(data.disambiguation, original?.disambiguation),
      gender: diffValue(genderEnum(data.gender), original?.gender),
      birthdate: diffValue(data.birthdate, original?.birth_date),
      deathdate: diffValue(data.deathdate, original?.death_date),
      career_start_year: diffValue(
        data.career_start_year,
        original?.career_start_year,
      ),
      career_end_year: diffValue(
        data.career_end_year,
        original?.career_end_year,
      ),
      height: diffValue(data.height, original?.height),
      band_size: diffValue(newBandSize, original?.band_size),
      cup_size: diffValue(newCupSize, original?.cup_size),
      waist_size: diffValue(data.waistSize, original?.waist_size),
      hip_size: diffValue(data.hipSize, original?.hip_size),
      breast_type: diffValue(
        breastType(data.breastType),
        original?.breast_type,
      ),
      country: diffValue(data.country, original?.country),
      ethnicity: diffValue(ethnicityEnum(data.ethnicity), original?.ethnicity),
      eye_color: diffValue(data.eye_color, original?.eye_color),
      hair_color: diffValue(data.hair_color, original?.hair_color),
      added_tattoos: addedTattoos,
      removed_tattoos: removedTattoos,
      added_piercings: addedPiercings,
      removed_piercings: removedPiercings,
      added_aliases: addedAliases,
      removed_aliases: removedAliases,
      added_images: addedImages,
      removed_images: removedImages,
      added_urls: addedUrls,
      removed_urls: removedUrls,
    },
  ];
};

export default selectPerformerDetails;
