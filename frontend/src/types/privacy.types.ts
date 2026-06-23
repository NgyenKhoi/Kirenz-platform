export type Visibility = 'PUBLIC' | 'FRIENDS_ONLY' | 'PRIVATE';

export interface PrivacySettingResponse {
  userId: string;
  profileVisibility: Visibility;
  postVisibility: Visibility;
  allowDirectMessages: boolean;
  showOnlineStatus: boolean;
  updatedAt: string;
}

export interface UpdatePrivacySettingRequest {
  profileVisibility?: Visibility;
  postVisibility?: Visibility;
  allowDirectMessages?: boolean;
  showOnlineStatus?: boolean;
}
