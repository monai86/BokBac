# Firestore Security Rules Documentation

To secure saved cases and settings in BokBac/MicrobialWorld, the following Firestore security rules must be deployed. These rules ensure that authenticated users can read and write only their own records, preventing cross-user data access.

## Firestore Security Rules

Deploy these rules in your Firebase Console under the "Firestore Database" -> "Rules" tab:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Matches the users collection
    match /users/{userId} {
      // Allow the user to read/write their own document (e.g. settings preferences)
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // Allow users to sync and manage their settings preferences subcollection
      match /settings/{settingId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      // Allow users to sync and manage their private case histories
      match /cases/{caseId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    // Deny access to all other paths by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Security Design Details

1. **Private Subcollections**:
   - Cases (`/users/{userId}/cases/{caseId}`) and Settings (`/users/{userId}/settings/{settingId}`) are nested under the corresponding `userId`.
   - Access is strictly gated: `request.auth.uid == userId` ensures no user can access another user's cases or settings.
   
2. **Anonymous Fallback**:
   - Guest/anonymous users do not make network calls to Firestore.
   - The frontend's `caseStorage` layer detects the absence of `request.auth` and reads/writes exclusively to the client's local storage.
