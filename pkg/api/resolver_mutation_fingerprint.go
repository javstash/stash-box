package api

import (
	"context"
	"errors"

	"github.com/gofrs/uuid"
	"github.com/stashapp/stash-box/pkg/models"
	"github.com/stashapp/stash-box/pkg/user"
)

func (r *mutationResolver) FingerprintPartUpdate(ctx context.Context, sceneID uuid.UUID, fingerprintID int, part *int) (bool, error) {
	repo := r.getRepoFactory(ctx)

	fingerprints, err := repo.Scene().GetFingerprints(sceneID)
	if err != nil {
		return false, err
	}

	currentUserID := user.GetCurrentUser(ctx).ID

	var fingerprint *models.SceneFingerprint
	for _, f := range fingerprints {
		if f.ID == fingerprintID && f.UserID == currentUserID {
			fingerprint = f
			break
		}
	}

	if fingerprint == nil {
		return false, nil
	}

	if !user.IsRole(ctx, models.RoleEnumModify) && fingerprint.UserID != currentUserID {
		return false, errors.New("you are not allowed to update this fingerprint")
	}

	fingerprint.Part = part

	err = repo.WithTxn(func() error {
		return repo.Scene().CreateOrReplaceFingerprints(models.SceneFingerprints{fingerprint})
	})
	if err != nil {
		return false, err
	}

	return true, nil
}
