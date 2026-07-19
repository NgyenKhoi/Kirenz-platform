import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { 
  Search, Bell, Heart, Mail, User, Users, UsersRound, Sparkles, 
  PlusCircle, Camera, Plus, Edit2, MapPin, Calendar, Link as LinkIcon, 
  Image as ImageIcon, Smile, MoreHorizontal, MessageSquare, Share2, ThumbsUp,
  UserPlus, UserMinus, Check, X, Loader2
} from 'lucide-react';
import Layout from './components/Layout';
import { useAuth } from './hooks/useAuth';
import { postService } from './services/post.service';
import { friendService } from './services/friend.service';
import { authService } from './services/auth.service';
import { privacyService } from './services/privacy.service';
import { PostCard } from './components/Post/PostCard';
import { CreatePost } from './components/Post/CreatePost';
import { MediaViewerModal } from './components/common/MediaViewerModal';
import { PostImageResponse, PostPrivacy, PostResponse } from './types/post.types';
import { ReactionSummaryResponse } from './types/reaction.types';
import { UserProfile as UserProfileType } from './types/auth.types';
import { FriendRequestResponse, FriendResponse, RelationshipStatus } from './types/friend.types';
import { useEscapeKey } from './hooks/useEscapeKey';

type ProfileTab = 'ABOUT' | 'POSTS' | 'FRIENDS' | 'PHOTOS';

const profileTabFromQuery = (value: string | null): ProfileTab => {
  const tab = value?.toLowerCase();
  if (tab === 'about') return 'ABOUT';
  if (tab === 'friends') return 'FRIENDS';
  if (tab === 'photos') return 'PHOTOS';
  return 'POSTS';
};

export default function UserProfile() {
  const { 
    user, 
    uploadAvatarAsync, 
    isUploadingAvatar, 
    updateProfileAsync, 
    isUpdatingProfile 
  } = useAuth();
  const { userId } = useParams<{ userId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const isOwnProfile = !userId || userId === user?.id;

  const [targetUser, setTargetUser] = useState<UserProfileType | null>(null);
  const [relationshipStatus, setRelationshipStatus] = useState<RelationshipStatus>('NONE');
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [profileRestricted, setProfileRestricted] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>(() => profileTabFromQuery(searchParams.get('tab')));

  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postError, setPostError] = useState<string | null>(null);
  const [postMessage, setPostMessage] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PostImageResponse[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [friends, setFriends] = useState<FriendResponse[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const [friendError, setFriendError] = useState<string | null>(null);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestResponse[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [requestActionId, setRequestActionId] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const friendCount = friends.length;

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    displayName: '',
    bio: '',
    location: '',
    website: '',
  });
  useEscapeKey(isEditModalOpen, () => setIsEditModalOpen(false));

  useEffect(() => {
    setActiveTab(profileTabFromQuery(searchParams.get('tab')));
  }, [searchParams]);

  useEffect(() => {
    if (isOwnProfile && searchParams.get('edit') === 'profile') {
      setIsEditModalOpen(true);
    }
  }, [isOwnProfile, searchParams]);

  const handleSetActiveTab = (tab: ProfileTab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'POSTS' ? {} : { tab: tab.toLowerCase() });
  };

  // Pre-fill the form whenever the modal is opened or the user data changes
  useEffect(() => {
    if (user && isEditModalOpen) {
      setEditFormData({
        displayName: user.displayName || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
      });
    }
  }, [user, isEditModalOpen]);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please choose an image file.');
      return;
    }

    setAvatarError(null);
    try {
      await uploadAvatarAsync(file);
    } catch {
      setAvatarError('Could not upload avatar. Please try again.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileAsync({
        displayName: editFormData.displayName,
        bio: editFormData.bio,
        location: editFormData.location,
        website: editFormData.website,
      });
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };


  const displayedUser = isOwnProfile ? user : targetUser;
  const displayName = displayedUser?.displayName || displayedUser?.username || 'User';
  const bio = displayedUser?.bio || (isOwnProfile ? 'Capturing life\'s little joys.' : 'No bio yet.');
  const location = displayedUser?.location || (isOwnProfile ? 'Portland, Oregon' : 'No location specified');
  const website = displayedUser?.website || '';
  const avatarUrl = displayedUser?.avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbY_GUlw34tnkyFIMOl2BKettMEaotAsjvlMn6C_uAYu2C3nM_ijw2rr7U9XDlyBU_0LlidZUITe7OACoMYLzy0O5RdjRo0fH9NEmNkLOhjpaIoRogweGdwOQ-QcP4_RepAyayI6_jVKYnJjekbEf07QzVchgO3G2gcSWct_pYdY99tJYJchT_3k1kNmpev6u7x_QcQx94o5RYQ1tq5OVrkvJSM5IlD4Q11oyMhGIqiJ2ENgSg_Qv24OaSlAfI-ypwo4U6jlVrwoA';
  const defaultCoverUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCG_4uv5c7LMPK5KoWQBZhw2UhexJJ8IIJLAk6l9zKKv7qDm2uCc4PU0QgciFnRx011VAxSWcTIlt_W169WWVryMv3s5jpnMViYu0PScoW1Rp7m7zehvHtLXADvwVAGMOXhDVxpcEfQdyysA2YBZZtpo183gpTP8uw7rAp2rdbrfqN6eA8a1PxyKsfK5FcRNMdDiaxvOMoR_kZKd7ErrytAtfm4J99HXQKAm9dXM2RLUIr6dR3zn79NAIqs7r64_ycRqGODy4c3dHk';
  const coverPhotoUrl = displayedUser?.coverPhotoUrl || defaultCoverUrl;
  const joinedDate = displayedUser?.createdAt ? new Date(displayedUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'September 2021';

  useEffect(() => {
    if (isOwnProfile) {
      setTargetUser(null);
      setProfileRestricted(false);
      setRelationshipStatus('SELF');
      return;
    }

    let isMounted = true;
    const fetchTargetUserDetails = async () => {
      setIsFetchingProfile(true);
      setProfileRestricted(false);
      try {
        const [statusData, privacyData] = await Promise.all([
          friendService.getStatus(userId!),
          privacyService.getUserPrivacySettings(userId!),
        ]);
        const canViewProfile =
          statusData.status === 'SELF' ||
          privacyData.profileVisibility === 'PUBLIC' ||
          (privacyData.profileVisibility === 'FRIENDS_ONLY' && statusData.status === 'FRIENDS');

        if (!canViewProfile) {
          if (isMounted) {
            setRelationshipStatus(statusData.status);
            setTargetUser(null);
            setProfileRestricted(true);
          }
          return;
        }

        const profileData = await authService.getUserProfile(userId!);
        if (isMounted) {
          setTargetUser(profileData);
          setRelationshipStatus(statusData.status);
          setProfileRestricted(false);
        }
      } catch (err) {
        console.error('Error fetching target user details:', err);
        if (isMounted) {
          setTargetUser(null);
          setProfileRestricted(false);
        }
      } finally {
        if (isMounted) {
          setIsFetchingProfile(false);
        }
      }
    };

    void fetchTargetUserDetails();
    return () => {
      isMounted = false;
    };
  }, [userId, isOwnProfile, profileRestricted]);

  useEffect(() => {
    let isMounted = true;
    const fetchFriends = async () => {
      setIsLoadingFriends(true);
      setFriendError(null);
      try {
        const id = isOwnProfile ? user?.id : userId;
        if (!id) {
          if (isMounted) setFriends([]);
          return;
        }
        const friendsList = isOwnProfile 
          ? await friendService.getFriends()
          : await friendService.getUserFriends(id);
        if (isMounted) {
          setFriends(friendsList || []);
        }
      } catch (err) {
        console.error('Error fetching friends:', err);
        if (isMounted) {
          setFriends([]);
          setFriendError('Could not load friends. Please try again.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingFriends(false);
        }
      }
    };
    void fetchFriends();
    return () => {
      isMounted = false;
    };
  }, [userId, isOwnProfile, user?.id, relationshipStatus, profileRestricted]);

  useEffect(() => {
    if (!isOwnProfile) {
      setIncomingRequests([]);
      setRequestError(null);
      return;
    }

    let isMounted = true;
    setIsLoadingRequests(true);
    setRequestError(null);
    friendService.getIncomingRequests()
      .then((requests) => {
        if (isMounted) setIncomingRequests(requests || []);
      })
      .catch((err) => {
        console.error('Error fetching incoming friend requests:', err);
        if (isMounted) setRequestError('Could not load friend requests. Please try again.');
      })
      .finally(() => {
        if (isMounted) setIsLoadingRequests(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOwnProfile, user?.id]);

  useEffect(() => {
    let isMounted = true;

    const loadPosts = async () => {
      if (profileRestricted) {
        setPosts([]);
        setIsLoadingPosts(false);
        return;
      }
      setIsLoadingPosts(true);
      setPostError(null);
      try {
        const response = isOwnProfile
          ? await postService.listMine()
          : await postService.listByUser(userId!);
        if (isMounted) {
          setPosts(response);
        }
      } catch {
        if (isMounted) {
          setPostError('Could not load posts. Please try again.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingPosts(false);
        }
      }
    };

    void loadPosts();
    return () => {
      isMounted = false;
    };
  }, [userId, isOwnProfile, profileRestricted]);

  useEffect(() => {
    let isMounted = true;

    const loadPhotos = async () => {
      if (profileRestricted) {
        setPhotos([]);
        setIsLoadingPhotos(false);
        return;
      }
      const id = isOwnProfile ? user?.id : userId;
      if (!id) {
        return;
      }

      setIsLoadingPhotos(true);
      setPhotoError(null);
      try {
        const response = await postService.listUserImages(id);
        if (isMounted) {
          setPhotos(response);
        }
      } catch {
        if (isMounted) {
          setPhotoError('Could not load photos. Please try again.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingPhotos(false);
        }
      }
    };

    void loadPhotos();
    return () => {
      isMounted = false;
    };
  }, [userId, isOwnProfile, user?.id, profileRestricted]);

  const handleSendRequest = async () => {
    if (!userId) return;
    setIsActionLoading(true);
    try {
      await friendService.sendRequest({ receiverId: userId });
      const statusRes = await friendService.getStatus(userId);
      setRelationshipStatus(statusRes.status);
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!userId) return;
    setIsActionLoading(true);
    try {
      const outgoing = await friendService.getOutgoingRequests();
      const matchingReq = outgoing.find(r => r.receiverId === userId);
      if (matchingReq) {
        await friendService.cancelRequest(matchingReq.id);
      }
      const statusRes = await friendService.getStatus(userId);
      setRelationshipStatus(statusRes.status);
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!userId) return;
    setIsActionLoading(true);
    try {
      const incoming = await friendService.getIncomingRequests();
      const matchingReq = incoming.find(r => r.requesterId === userId);
      if (matchingReq) {
        await friendService.acceptRequest(matchingReq.id);
      }
      const statusRes = await friendService.getStatus(userId);
      setRelationshipStatus(statusRes.status);
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeclineRequest = async () => {
    if (!userId) return;
    setIsActionLoading(true);
    try {
      const incoming = await friendService.getIncomingRequests();
      const matchingReq = incoming.find(r => r.requesterId === userId);
      if (matchingReq) {
        await friendService.declineRequest(matchingReq.id);
      }
      const statusRes = await friendService.getStatus(userId);
      setRelationshipStatus(statusRes.status);
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!userId) return;
    setIsActionLoading(true);
    try {
      await friendService.removeFriend(userId);
      const statusRes = await friendService.getStatus(userId);
      setRelationshipStatus(statusRes.status);
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAcceptPendingRequest = async (request: FriendRequestResponse) => {
    setRequestActionId(request.id);
    setRequestError(null);
    try {
      const acceptedFriend = await friendService.acceptRequest(request.id);
      setIncomingRequests((current) => current.filter((item) => item.id !== request.id));
      setFriends((current) => current.some((item) => item.friendId === acceptedFriend.friendId)
        ? current
        : [acceptedFriend, ...current]);
    } catch (err) {
      console.error('Error accepting friend request:', err);
      setRequestError('Could not accept this friend request. Please try again.');
    } finally {
      setRequestActionId(null);
    }
  };

  const handleRejectPendingRequest = async (requestId: string) => {
    setRequestActionId(requestId);
    setRequestError(null);
    try {
      await friendService.declineRequest(requestId);
      setIncomingRequests((current) => current.filter((item) => item.id !== requestId));
    } catch (err) {
      console.error('Error rejecting friend request:', err);
      setRequestError('Could not reject this friend request. Please try again.');
    } finally {
      setRequestActionId(null);
    }
  };

  const handleUpdatePost = async (postId: string, data: any) => {
    const updated = await postService.update(postId, data);
    setPosts((current) => current.map((post) => (post.id === postId ? updated : post)));
  };

  const handleDeletePost = async (postId: string) => {
    await postService.remove(postId);
    setPosts((current) => current.filter((post) => post.id !== postId));
  };

  const handleSharePost = async (postId: string, caption: string) => {
    const shared = await postService.share(postId, { caption });
    if (isOwnProfile) {
      setPosts((current) => [shared, ...current]);
    }
  };

  const handleCommentCountChange = (postId: string, delta: number) => {
    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? { ...post, commentsCount: Math.max(0, post.commentsCount + delta) }
          : post
      )
    );
  };

  const handleReactionSummaryChange = (postId: string, summary: ReactionSummaryResponse) => {
    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? { ...post, reactionsCount: summary.totalCount, reactionSummary: summary }
          : post
      )
    );
  };

  if (!isOwnProfile && isFetchingProfile) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen text-primary">
          <Loader2 size={48} className="animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!isOwnProfile && profileRestricted) {
    return (
      <Layout>
        <main className="flex min-h-screen items-center justify-center bg-surface px-6 text-center text-on-surface">
          <div className="max-w-md rounded-[2rem] bg-surface-container-lowest p-8 shadow-xl">
            <UsersRound size={48} className="mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold">User này đã ẩn profile của mình</h2>
            <p className="mt-3 text-sm font-medium text-on-surface-variant">Hãy kết bạn để xem profile, bài viết, bạn bè và ảnh của người dùng này.</p>
            <Link to="/explore" className="mt-5 inline-flex rounded-full bg-primary px-6 py-2 text-sm font-bold text-on-primary">
              Back to Explore
            </Link>
          </div>
        </main>
      </Layout>
    );
  }

  if (!isOwnProfile && !targetUser && !isFetchingProfile) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-2xl font-bold text-on-surface">User Not Found</h2>
          <p className="text-on-surface-variant mt-2">The user you are looking for does not exist.</p>
          <Link to="/explore" className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-full font-bold">
            Back to Explore
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-surface text-on-surface min-h-screen pb-20 md:pb-0">
        
        {/* Mobile Header (Optional) */}
        <header className="md:hidden flex justify-between items-center mb-0 mt-4 px-6 z-50 absolute w-full top-0">
           <div className="flex gap-2 ml-auto">
            <button className="bg-surface/50 backdrop-blur p-2 rounded-full text-on-surface hover:text-primary">
              <Search size={20} />
            </button>
            <button className="bg-surface/50 backdrop-blur p-2 rounded-full text-on-surface hover:text-primary">
              <Bell size={20} />
            </button>
           </div>
        </header>

        {/* Main Content */}
        <main className="min-h-screen">
          {/* Header Section */}
          <div className="relative">
            {/* Cover Photo */}
            <div className="h-64 md:h-80 w-full overflow-hidden relative group">
              <img 
                alt="Cover" 
                src={coverPhotoUrl}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
              
              {isOwnProfile && (
                <Link 
                  to="/edit-cover" 
                  className="absolute top-4 right-4 md:top-6 md:right-6 bg-white/20 hover:bg-white/40 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold flex items-center gap-2 transition-all border border-white/30 hover:scale-105 active:scale-95"
                >
                  <Camera size={18} />
                  <span className="hidden sm:inline">Edit Cover Photo</span>
                </Link>
              )}
            </div>
            
            {/* Profile Info Container */}
            <div className="max-w-[1000px] mx-auto px-4 -mt-16 md:-mt-24 relative z-10">
              <div className="flex flex-col md:flex-row md:items-end gap-6 md:justify-between bg-surface/80 backdrop-blur-md p-6 rounded-[2rem] shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)] border border-surface-container">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                  <div className="relative">
                    <img 
                      alt={displayName} 
                      src={avatarUrl}
                      className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-surface ring-4 ring-primary-container object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  <div className="pb-2">
                    <h1 className="text-3xl font-bold text-on-surface">{displayName}</h1>
                    <div className="flex gap-4 mt-2 justify-center md:justify-start text-on-surface-variant font-medium">
                      <span><strong className="text-on-surface">{friendCount}</strong> friend{friendCount === 1 ? '' : 's'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 justify-center mb-2 md:mb-0">
                  {isOwnProfile ? (
                    <>
                      <button 
                        onClick={() => setIsEditModalOpen(true)}
                        className="bg-surface-container-high text-on-surface-variant px-6 py-3 rounded-full font-bold flex items-center gap-2 active:scale-95 border-2 border-outline-variant hover:bg-surface-container-highest transition-all"
                      >
                        <Edit2 size={20} />
                        Edit Profile
                      </button>
                    </>
                  ) : (
                    <>
                      {relationshipStatus === 'NONE' && (
                        <button
                          onClick={handleSendRequest}
                          disabled={isActionLoading}
                          className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold flex items-center gap-2 active:scale-95 shadow-[0_4px_12px_rgba(139,78,62,0.3)] hover:brightness-110 transition-all disabled:opacity-60"
                        >
                          {isActionLoading ? <Loader2 size={20} className="animate-spin" /> : <UserPlus size={20} />}
                          Add Friend
                        </button>
                      )}
                      {relationshipStatus === 'OUTGOING_REQUEST' && (
                        <button
                          onClick={handleCancelRequest}
                          disabled={isActionLoading}
                          className="bg-error-container text-on-error-container px-6 py-3 rounded-full font-bold flex items-center gap-2 active:scale-95 hover:brightness-95 transition-all disabled:opacity-60"
                        >
                          {isActionLoading ? <Loader2 size={20} className="animate-spin" /> : <UserMinus size={20} />}
                          Cancel Request
                        </button>
                      )}
                      {relationshipStatus === 'INCOMING_REQUEST' && (
                        <>
                          <button
                            onClick={handleAcceptRequest}
                            disabled={isActionLoading}
                            className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold flex items-center gap-2 active:scale-95 shadow-[0_4px_12px_rgba(139,78,62,0.3)] hover:brightness-110 transition-all disabled:opacity-60"
                          >
                            {isActionLoading ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                            Accept Request
                          </button>
                          <button
                            onClick={handleDeclineRequest}
                            disabled={isActionLoading}
                            className="bg-surface-container-high text-on-surface-variant px-6 py-3 rounded-full font-bold flex items-center gap-2 active:scale-95 border-2 border-outline-variant hover:bg-surface-container-highest transition-all disabled:opacity-60"
                          >
                            {isActionLoading ? <Loader2 size={20} className="animate-spin" /> : <X size={20} />}
                            Decline
                          </button>
                        </>
                      )}
                      {relationshipStatus === 'FRIENDS' && (
                        <button
                          onClick={handleRemoveFriend}
                          disabled={isActionLoading}
                          className="bg-error-container text-on-error-container px-6 py-3 rounded-full font-bold flex items-center gap-2 active:scale-95 hover:brightness-95 transition-all disabled:opacity-60"
                        >
                          {isActionLoading ? <Loader2 size={20} className="animate-spin" /> : <UserMinus size={20} />}
                          Remove Friend
                        </button>
                      )}
                      {relationshipStatus === 'BLOCKED' && (
                        <span className="px-6 py-3 text-sm font-bold text-error bg-error-container/20 rounded-full border border-error/30">
                          Blocked
                        </span>
                      )}
                      {relationshipStatus === 'BLOCKED_BY_TARGET' && (
                        <span className="px-6 py-3 text-sm font-bold text-on-surface-variant bg-surface-container-high rounded-full">
                          Unavailable
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              {/* Tabs */}
              <div className="flex border-b border-surface-variant mt-6 px-2 overflow-x-auto gap-8 hide-scrollbar">
                {([
                  ['POSTS', 'Posts'],
                  ['ABOUT', 'About'],
                  ['FRIENDS', 'Friends'],
                  ['PHOTOS', 'Photos'],
                ] as const).map(([tab, label]) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => handleSetActiveTab(tab)}
                    className={`px-4 py-4 font-bold whitespace-nowrap outline-none ${activeTab === tab ? 'text-primary border-b-4 border-primary' : 'text-on-surface-variant hover:text-primary transition-colors'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Content Grid */}
          <div className="max-w-[1000px] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Intro & Photos Preview */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Intro Card */}
              <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)] border border-surface-container">
                <h3 className="text-xl font-bold text-on-surface mb-4">Intro</h3>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <MapPin size={24} className="text-primary shrink-0" />
                    <span className="text-base font-medium">Lives in {location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <Calendar size={24} className="text-primary shrink-0" />
                    <span className="text-base font-medium">Joined {joinedDate}</span>
                  </div>
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <LinkIcon size={24} className="text-primary shrink-0" />
                    <a href={`https://${website}`} target="_blank" rel="noopener noreferrer" className="text-base font-bold text-tertiary hover:underline">{website}</a>
                  </div>
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <Heart size={24} className="text-primary shrink-0" />
                    <span className="text-base font-medium">{bio}</span>
                  </div>
                </div>
                 {isOwnProfile && (
                   <button 
                     onClick={() => setIsEditModalOpen(true)}
                     className="w-full mt-6 py-3 bg-surface-container-high rounded-full font-bold text-on-surface-variant active:scale-95 hover:bg-surface-container-highest transition-all text-center flex items-center justify-center"
                   >
                     Edit Bio
                   </button>
                 )}
              </div>

              {/* Photos Preview Card */}
              <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)] border border-surface-container">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-on-surface">Photos</h3>
                  <span className="text-primary font-bold text-sm">{photos.length}</span>
                </div>
                {isLoadingPhotos ? (
                  <div className="rounded-xl bg-surface-container-low p-4 text-center text-sm font-bold text-on-surface-variant">
                    Loading photos...
                  </div>
                ) : photoError ? (
                  <div className="rounded-xl bg-error-container p-4 text-center text-sm font-bold text-on-error-container">
                    {photoError}
                  </div>
                ) : photos.length === 0 ? (
                  <div className="rounded-xl bg-surface-container-low p-4 text-center text-sm font-bold text-on-surface-variant">
                    No photos yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {photos.slice(0, 9).map((photo, index) => (
                      <button
                        key={`${photo.postId}-${photo.url}`}
                        type="button"
                        onClick={() => setSelectedPhotoIndex(index)}
                        className="aspect-square overflow-hidden rounded-xl bg-surface-container-low active:scale-95"
                        aria-label={`Open profile photo ${index + 1}`}
                      >
                        <img
                          src={photo.url}
                          alt="Profile post media"
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
            </div>

            {/* Right Column: Posts Feed */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {activeTab === 'ABOUT' && (
                <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)] border border-surface-container">
                  <h3 className="text-xl font-bold text-on-surface mb-5">About</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 text-on-surface-variant">
                      <Heart size={22} className="text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.08em] text-outline">Bio</p>
                        <p className="text-base font-medium text-on-surface">{bio}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-on-surface-variant">
                      <MapPin size={22} className="text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.08em] text-outline">Location</p>
                        <p className="text-base font-medium text-on-surface">{location}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-on-surface-variant">
                      <Calendar size={22} className="text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.08em] text-outline">Joined</p>
                        <p className="text-base font-medium text-on-surface">{joinedDate}</p>
                      </div>
                    </div>
                    {website && (
                      <div className="flex items-start gap-3 text-on-surface-variant">
                        <LinkIcon size={22} className="text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.08em] text-outline">Website</p>
                          <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="text-base font-bold text-tertiary hover:underline">
                            {website}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'FRIENDS' && (
                <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)] border border-surface-container">
                  {isOwnProfile && (
                    <section className="mb-8">
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-on-surface">Friend requests</h3>
                          <p className="mt-1 text-sm text-on-surface-variant">Review people who want to connect with you.</p>
                        </div>
                        {incomingRequests.length > 0 && (
                          <span className="rounded-full bg-primary-container px-3 py-1 text-xs font-bold text-on-primary-container">
                            {incomingRequests.length} pending
                          </span>
                        )}
                      </div>

                      {requestError && (
                        <div className="mb-3 rounded-xl bg-error-container p-4 text-sm font-bold text-on-error-container">
                          {requestError}
                        </div>
                      )}

                      {isLoadingRequests ? (
                        <div className="rounded-xl bg-surface-container-low p-6 text-center text-sm font-bold text-on-surface-variant">
                          Loading friend requests...
                        </div>
                      ) : incomingRequests.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-low p-6 text-center text-sm font-bold text-on-surface-variant">
                          No pending friend requests.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {incomingRequests.map((request) => {
                            const requesterName = request.displayName || request.username || 'Kirenz User';
                            const isWorking = requestActionId === request.id;
                            return (
                              <div key={request.id} className="flex flex-col gap-4 rounded-2xl border border-outline-variant bg-surface-container-low p-4 sm:flex-row sm:items-center">
                                <Link to={`/profile/${request.requesterId}`} className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-80">
                                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-container font-bold text-on-primary-container">
                                    {request.avatarUrl ? (
                                      <img src={request.avatarUrl} alt={requesterName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                      requesterName.slice(0, 1).toUpperCase()
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate font-bold text-on-surface">{requesterName}</p>
                                    {request.username && <p className="truncate text-xs font-bold text-primary">@{request.username}</p>}
                                  </div>
                                </Link>
                                <div className="flex gap-2 sm:shrink-0">
                                  <button
                                    type="button"
                                    disabled={isWorking}
                                    onClick={() => void handleRejectPendingRequest(request.id)}
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-outline-variant px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container disabled:opacity-60 sm:flex-none"
                                  >
                                    {isWorking ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                                    Reject
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isWorking}
                                    onClick={() => void handleAcceptPendingRequest(request)}
                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60 sm:flex-none"
                                  >
                                    {isWorking ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                    Accept
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  )}

                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-on-surface">Friends</h3>
                    <span className="text-sm font-bold text-on-surface-variant">{friendCount} friend{friendCount === 1 ? '' : 's'}</span>
                  </div>
                  {isLoadingFriends ? (
                    <div className="rounded-xl bg-surface-container-low p-8 text-center text-sm font-bold text-on-surface-variant">
                      Loading friends...
                    </div>
                  ) : friendError ? (
                    <div className="rounded-xl bg-error-container p-8 text-center text-sm font-bold text-on-error-container">
                      {friendError}
                    </div>
                  ) : friends.length === 0 ? (
                    <div className="rounded-xl bg-surface-container-low p-8 text-center text-sm font-bold text-on-surface-variant">
                      No friends yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {friends.map((friend) => {
                        const friendName = friend.displayName || friend.username || 'Kirenz User';
                        return (
                          <Link
                            key={friend.friendshipId || friend.friendId}
                            to={`/profile/${friend.friendId}`}
                            className="flex min-w-0 items-center gap-3 rounded-2xl border border-outline-variant bg-surface-container-low p-4 transition-all hover:border-primary/40 hover:bg-surface-container"
                          >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-container text-on-primary-container font-bold">
                              {friend.avatarUrl ? (
                                <img src={friend.avatarUrl} alt={friendName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                friendName.slice(0, 1).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-bold text-on-surface">{friendName}</p>
                              {friend.username && <p className="truncate text-xs font-bold text-primary">@{friend.username}</p>}
                              {friend.bio && <p className="mt-1 line-clamp-1 text-xs text-on-surface-variant">{friend.bio}</p>}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'PHOTOS' && (
                <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)] border border-surface-container">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-on-surface">Photos</h3>
                    <span className="text-sm font-bold text-on-surface-variant">{photos.length} photo{photos.length === 1 ? '' : 's'}</span>
                  </div>
                  {isLoadingPhotos ? (
                    <div className="rounded-xl bg-surface-container-low p-8 text-center text-sm font-bold text-on-surface-variant">
                      Loading photos...
                    </div>
                  ) : photoError ? (
                    <div className="rounded-xl bg-error-container p-8 text-center text-sm font-bold text-on-error-container">
                      {photoError}
                    </div>
                  ) : photos.length === 0 ? (
                    <div className="rounded-xl bg-surface-container-low p-8 text-center text-sm font-bold text-on-surface-variant">
                      No photos yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {photos.map((photo, index) => (
                        <button
                          key={`${photo.postId}-${photo.url}-full`}
                          type="button"
                          onClick={() => setSelectedPhotoIndex(index)}
                          className="aspect-square overflow-hidden rounded-xl bg-surface-container-low active:scale-95"
                          aria-label={`Open profile photo ${index + 1}`}
                        >
                          <img
                            src={photo.url}
                            alt="Profile post media"
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'POSTS' && (
                <>
              
              {/* Create Post (Mini) */}
              {isOwnProfile && (
                <CreatePost
                  user={user}
                  className="border border-surface-container"
                  onCreated={(created) => {
                    setPosts((current) => [created, ...current]);
                    const createdImages = created.media
                      .filter((media) => media.type === 'IMAGE')
                      .map((media) => ({
                        postId: created.id,
                        url: media.url,
                        publicId: media.publicId,
                        createdAt: created.createdAt,
                      }));
                    if (createdImages.length > 0) {
                      setPhotos((current) => [...createdImages, ...current]);
                    }
                    setPostError(null);
                  }}
                  onError={(message) => {
                    setPostMessage(null);
                    setPostError(message || null);
                  }}
                  onSuccess={(message) => {
                    setPostError(null);
                    setPostMessage(message || null);
                  }}
                />
              )}

              {postMessage && (
                <div className="rounded-[2rem] bg-primary-container px-5 py-4 text-sm font-bold text-on-primary-container">
                  {postMessage}
                </div>
              )}

              {postError && (
                <div className="rounded-[2rem] bg-error-container px-5 py-4 text-sm font-bold text-on-error-container">
                  {postError}
                </div>
              )}

              {isLoadingPosts ? (
                <div className="bg-surface-container-lowest rounded-[2rem] p-8 text-center text-on-surface-variant font-bold border border-surface-container">
                  Loading your posts...
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-surface-container-lowest rounded-[2rem] p-8 text-center text-on-surface-variant font-bold border border-surface-container">
                  You have not posted anything yet.
                </div>
              ) : (
                posts.map((post) => (
                  <React.Fragment key={post.id}>
                    <PostCard
                      post={post}
                      currentUserId={user?.id}
                      currentUserAvatarUrl={user?.avatarUrl}
                      onUpdate={handleUpdatePost}
                      onDelete={handleDeletePost}
                      onShare={handleSharePost}
                      onCommentCountChange={handleCommentCountChange}
                      onReactionSummaryChange={handleReactionSummaryChange}
                    />
                  </React.Fragment>
                ))
              )}
                </>
              )}

              {/* Feed Post 1 */}
              <article className="hidden bg-surface-container-lowest rounded-[2rem] shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)] p-6 border border-surface-container hover:shadow-[0_0_20px_rgba(255,176,156,0.3)] transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgclLBJo25expsXmBpa58xNNqpANNZ2zeZtY8MMp531ZRhcyuOYZDP1AK4Z6Rwfc20jjCOnnWeMpvEy8MdKPxqM7kwntSskyKFu51DwcDxsu_4h3RkdpbHWIwZIu9SnV7NtYOkArsMNfQEf2LV-35YJhVK5XsD1QyqEe0GjIUe2sIrUHFHX0vSFugV56hOCVfNTFutJ1WI-LcHsqw7Me9ro9u8bow6KcispK8I9p6lFJFv05L0uwwmCSQ6XPuA5diiWrjfpZ3OhD4"
                      alt="Alex Rivera"
                      className="w-12 h-12 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-lg font-bold text-on-surface leading-tight">Alex Rivera</h4>
                      <span className="text-[12px] font-bold text-outline-variant">2 hours ago â€¢ Public</span>
                    </div>
                  </div>
                  <button className="text-outline hover:text-on-surface transition-colors p-2 rounded-full hover:bg-surface-container">
                    <MoreHorizontal size={24} />
                  </button>
                </div>
                
                <p className="text-base font-medium text-on-surface mb-4">
                  Found this beautiful corner in the park today. Nature always knows how to reset the soul. ðŸŒ¿âœ¨
                </p>
                
                <div className="rounded-[1.5rem] overflow-hidden mb-4">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC94qfhd1h4zL-iFK9nO1KMnSUFeU7fFF7OKPOD1TH8B0sZrObPo4AdKEi17Ix5lzonDmnwsEGAraX9Qsk1ERPMlCrJE229LHm0mRobNVSE6TYhuKmXnPp8ytVobk5bu4gUftw7DANYQhwwdLpcJR6EBhEEMax940LvI8_lujsIctQ4owqbXgjrUH2olEkoMRKaSM-Z38PaQcgxw3g2bsG5hcuvjElOcoxxX6dpksPDo3kUvQAO8wngHovxUcSGdJ-Bwsh-fP4cap0"
                    alt="Park trail"
                    className="w-full h-64 sm:h-80 object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <div className="flex items-center justify-between py-3 border-y border-outline-variant/30">
                  <div className="flex items-center -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-surface-container-lowest z-20">
                      <Heart size={14} className="text-white fill-current" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border-2 border-surface-container-lowest z-10">
                      <Sparkles size={14} className="text-white fill-current" />
                    </div>
                    <span className="pl-4 text-xs font-bold text-on-surface-variant">42 people reacted</span>
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant">12 comments</span>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-primary-fixed text-primary rounded-full transition-all active:scale-95 text-sm font-bold">
                    <Heart size={20} /> <span className="hidden sm:inline">Love</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-secondary-fixed text-secondary rounded-full transition-all active:scale-95 text-sm font-bold">
                    <MessageSquare size={20} /> <span className="hidden sm:inline">Comment</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-tertiary-fixed text-tertiary rounded-full transition-all active:scale-95 text-sm font-bold">
                    <Share2 size={20} /> <span className="hidden sm:inline">Share</span>
                  </button>
                </div>
              </article>

              {/* Feed Post 2 */}
              <article className="hidden bg-surface-container-lowest rounded-[2rem] shadow-[0_10px_30px_-12px_rgba(255,176,156,0.15)] p-6 border border-surface-container hover:shadow-[0_0_20px_rgba(255,176,156,0.3)] transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0CKoxyvz8LBy35PGCZMciqnVFXfHe3e2s6UFCYPxOkDecU5m8LJiraFw7idjozOqJsQ71QYW4RuoY1ns43erMiFKfN7EUOMKsI2gcDnacSM58unWLZOIfI9CorOwW4iPcAi8ckJpcGHJkztHFnoY7SSjCIssSYhMr249jwRZbucml7vTK38vfGTKrarAAauj27ffk79pRpLAMWLKJj-nMlpZeghYE4TtJOZdzqv7U-K7IanPE-XhmNwNTfvn-80VCOd8SrLVBvQY"
                      alt="Alex Rivera"
                      className="w-12 h-12 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-lg font-bold text-on-surface leading-tight">Alex Rivera</h4>
                      <span className="text-[12px] font-bold text-outline-variant">Yesterday at 6:15 PM â€¢ Friends</span>
                    </div>
                  </div>
                  <button className="text-outline hover:text-on-surface transition-colors p-2 rounded-full hover:bg-surface-container">
                    <MoreHorizontal size={24} />
                  </button>
                </div>
                
                <p className="text-base font-medium text-on-surface mb-4">
                  The sourdough experiment continues! Best loaf yet. ðŸžâ˜•ï¸
                </p>
                
                <div className="grid grid-cols-2 gap-2 rounded-[1.5rem] overflow-hidden mb-4">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTCOHNFRsCQ882A19vhRMS5XWwfwpvUz5Twda0_JH7b1xRPF0aGeKLjMOMm56zuPvdxB6WJivjOt9Y-UtEJhAHbacDi0CHSckxoCEmauBPHxmsUP9FBjYVLOF3z3nk9PaG8VmXAl1mYrnHn3cS18D03-p0o0Y2xvFGmA3o8JOugcUgmGWBM47NbNlzObRvAOo7wcVp4AYCViQrjrS6G_geVZHDC0cSSQ-94hGJ10FHLDQJj1dEYRT5z6zm5SGNqUaDP8t6HfaeWvw"
                    alt="Sourdough loaf"
                    className="h-48 sm:h-60 w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVFtzglZwWA9Tk5pS848L5nj-Yz8vuMjhQfS7gJ3l-9h48CwBFeBKvS7uS_lOQg3l4tLpERx_6TCxldtyhlZESGFUQp2XpbvruvENm0uSEYHJGappKxbtxH0uBMlyKPW2YJ6KxFE4x9m8lVs5czYMTFg_E8wx5O66KcTcvr8xjaQqL0YJoINEiD1TkOntPvQX0tr-cWMCYDyPo3IJq5pRniw8G_7V2kh1zg3yyS6OeINNDqv9y8cGcwkSQOyeaRWTj0mw_s6bIC6s"
                    alt="Coffee and bread"
                    className="h-48 sm:h-60 w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-outline-variant/30">
                  <div className="flex items-center -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-tertiary flex items-center justify-center border-2 border-surface-container-lowest z-10">
                      <ThumbsUp size={14} className="text-white fill-current" />
                    </div>
                    <span className="pl-4 text-xs font-bold text-on-surface-variant">88 people reacted</span>
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant">24 comments</span>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-primary-fixed text-primary rounded-full transition-all active:scale-95 text-sm font-bold">
                    <Heart size={20} /> <span className="hidden sm:inline">Love</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-secondary-fixed text-secondary rounded-full transition-all active:scale-95 text-sm font-bold">
                    <MessageSquare size={20} /> <span className="hidden sm:inline">Comment</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-tertiary-fixed text-tertiary rounded-full transition-all active:scale-95 text-sm font-bold">
                    <Share2 size={20} /> <span className="hidden sm:inline">Share</span>
                  </button>
                </div>
              </article>

            </div>
          </div>
        </main>
      </div>
      {selectedPhotoIndex !== null && (
        <MediaViewerModal
          media={photos.map((photo) => ({
            type: 'IMAGE' as const,
            url: photo.url,
            publicId: photo.publicId,
          }))}
          index={selectedPhotoIndex}
          onClose={() => setSelectedPhotoIndex(null)}
        />
      )}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-[2rem] border border-outline-variant/30 shadow-2xl p-6 md:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto hide-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
              <h3 className="text-2xl font-bold text-on-surface flex items-center gap-2">
                <Edit2 size={24} className="text-primary" />
                Edit Profile
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-2 hover:bg-surface-container rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProfile} className="space-y-5 animate-in fade-in duration-200">
              {/* Avatar Section inside Edit Profile dialog */}
              <div className="flex flex-col items-center justify-center gap-2 pb-4 border-b border-outline-variant/20">
                <div className="relative group">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <img 
                    alt={displayName} 
                    src={avatarUrl}
                    className="w-24 h-24 rounded-full border-4 border-surface ring-4 ring-primary-container object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <button 
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute bottom-1 right-1 bg-secondary-container p-2 rounded-full shadow-lg active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-60 hover:brightness-105"
                    aria-label="Change avatar"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 size={16} className="text-on-secondary-container animate-spin" />
                    ) : (
                      <Camera size={16} className="text-on-secondary-container" />
                    )}
                  </button>
                </div>
                <span className="text-sm font-bold text-on-surface-variant">Profile Picture</span>
                {avatarError && <p className="text-xs font-bold text-error mt-1">{avatarError}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-on-surface-variant ml-2">Full Name</label>
                <input 
                  type="text" 
                  name="displayName"
                  value={editFormData.displayName}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  required
                  placeholder="Your full display name"
                  className="bg-surface p-4 rounded-full border-2 border-outline-variant/30 focus:border-primary focus:ring-0 transition-colors text-base font-medium text-on-surface outline-none" 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-on-surface-variant ml-2">Bio</label>
                <textarea 
                  rows={3}
                  name="bio"
                  value={editFormData.bio}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself"
                  className="bg-surface p-4 rounded-2xl border-2 border-outline-variant/30 focus:border-primary focus:ring-0 transition-colors text-base font-medium text-on-surface outline-none resize-none" 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-on-surface-variant ml-2">Location</label>
                <input 
                  type="text" 
                  name="location"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g. Portland, Oregon"
                  className="bg-surface p-4 rounded-full border-2 border-outline-variant/30 focus:border-primary focus:ring-0 transition-colors text-base font-medium text-on-surface outline-none" 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-on-surface-variant ml-2">Website</label>
                <input 
                  type="url" 
                  name="website"
                  value={editFormData.website}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://example.com"
                  className="bg-surface p-4 rounded-full border-2 border-outline-variant/30 focus:border-primary focus:ring-0 transition-colors text-base font-medium text-on-surface outline-none" 
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-outline-variant/30">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-3 rounded-full text-sm font-bold text-on-surface-variant hover:bg-surface-variant transition-colors active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-8 py-3 rounded-full text-sm font-bold bg-primary text-on-primary shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 min-w-[140px]"
                >
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}


