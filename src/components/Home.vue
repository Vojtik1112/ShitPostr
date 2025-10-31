<template>
  <div v-if="currentUser" class="main-feed">
    <aside class="sidebar">
      <div class="profile-card">
        <img :src="currentUser.avatarUrl || defaultAvatar" class="profile-avatar" alt="Avatar" />
        <div class="profile-name">{{ currentUser.username }}</div>
        <div v-if="currentUser.bio" class="profile-bio">{{ currentUser.bio }}</div>
        <div class="profile-actions">
          <button class="profile-btn" @click="openProfileModal = true">Upravit profil</button>
        </div>
      </div>
      <button class="add-post-btn" @click="openPostForm = true">➕ Přidat příspěvek</button>
      <div class="sidebar-top">
        <button class="logout-btn" @click="logout">⟵ Odhlásit se</button>
      </div>
    </aside>
    <section class="feed-section">
      <div class="insta-feed" ref="feedEl">
        <div
          v-for="post in postsSorted"
          :key="post.id"
          :class="['feed-post', post.userId === currentUser.id ? 'own-post' : 'other-post']"
        >
          <div class="feed-author-row">
            <img
              class="feed-author-avatar"
              :src="(users.find(u => u.id === post.userId) || {}).avatarUrl || defaultAvatar"
              alt="avatar"
            />
            <button type="button" class="user-link feed-author" @click="openUserInfo(post.userId)">
              {{ (users.find(u => u.id === post.userId) || {}).username || 'Neznámý' }}
            </button>
          </div>
          <img v-if="post.imageUrl" :src="post.imageUrl" class="feed-post-img" />
          <div class="feed-caption">{{ post.text }}</div>
          <div class="feed-actions">
            <button class="like-btn" :class="{ liked: post.likes?.includes(currentUser.id) }" @click="likePost(post)">
              ❤️ {{ post.likes ? post.likes.length : 0 }}
            </button>
            <button class="chat-btn" @click="toggleComment(post.id)">
              💬
            </button>
            <button
              v-if="post.userId === currentUser.id"
              class="delete-btn"
              @click="deletePost(post)"
            >🗑️</button>
          </div>
          <div class="feed-comments">
            <div v-for="comm in post.comments || []" :key="comm.id" class="single-comment">
              <span class="c-author user-link" @click="openUserInfo(comm.userId)">{{ comm.username }}:</span> {{ comm.text }}
            </div>
            <form class="comment-form"
              v-show="activeCommentId === post.id"
              @submit.prevent="addComment(post)">
              <input v-model="commentInputs[post.id]" type="text" placeholder="Přidat komentář..." />
              <button class="com-btn" type="submit">Odeslat</button>
            </form>
          </div>
        </div>
      </div>
      <div v-if="openPostForm" class="modal-post-backdrop" @click.self="openPostForm = false">
        <div class="modal-post">
          <h3>Přidat příspěvek</h3>
          <input type="file" accept="image/*" @change="onImageChange" />
          <textarea rows="3" v-model="postCaption" placeholder="Popisek..."></textarea>
          <button class="post-btn" @click="addPost">Postnout</button>
          <button class="close-btn" @click="openPostForm = false">Zavřít</button>
          <div v-if="previewImg" class="preview"><img :src="previewImg" /></div>
        </div>
      </div>
      <div v-if="openProfileModal" class="modal-post-backdrop" @click.self="closeProfileModal">
        <div class="modal-post">
          <h3>Upravit profil</h3>
          <div class="profile-edit-avatar">
            <img :src="profilePreview || currentUser.avatarUrl || defaultAvatar" />
          </div>
          <input type="file" accept="image/*" @change="onProfileAvatarChange" />
          <input type="text" v-model="profileName" placeholder="Uživatelské jméno" />
          <textarea rows="3" v-model="profileBio" placeholder="Bio"></textarea>
          <div class="profile-edit-actions">
            <button class="post-btn" @click="saveProfile">Uložit</button>
            <button class="close-btn" @click="closeProfileModal">Zavřít</button>
          </div>
        </div>
      </div>
      <div v-if="openUserModal" class="modal-post-backdrop" @click.self="closeUserInfo">
        <div class="modal-user">
          <div class="user-modal-header">
            <img :src="(selectedUser && selectedUser.avatarUrl) || defaultAvatar" class="user-modal-avatar" alt="avatar" />
            <div class="user-modal-name">{{ selectedUser?.username || 'Neznámý' }}</div>
            <div v-if="selectedUser?.bio" class="user-modal-bio">{{ selectedUser.bio }}</div>
          </div>
          <div class="user-modal-stats">
            <div class="stat-item"><span>Počet příspěvků</span><b>{{ userPostCount }}</b></div>
            <div class="stat-item"><span>Počet komentářů</span><b>{{ userCommentCount }}</b></div>
            <div class="stat-item total"><span>Celkem aktivit</span><b>{{ userPostCount + userCommentCount }}</b></div>
          </div>
          <div class="profile-edit-actions">
            <button class="close-btn" @click="closeUserInfo">Zavřít</button>
          </div>
        </div>
      </div>
      <div v-if="deleteModalPostId !== null" class="modal-delete-backdrop" @click.self="closeDeleteModal">
        <div class="modal-delete">
          <div class="modal-delete-title">Opravdu chcete tento příspěvek smazat?</div>
          <div class="modal-delete-actions">
            <button class="delete-final-btn delete-danger" @click="confirmDeletePost">Ano, smazat</button>
            <button class="delete-final-btn" @click="closeDeleteModal">Ne, zrušit</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
const LOCAL_USERS = 'shitpostr_users_v1';
const LOCAL_POSTS = 'shitpostr_wall_v1';
const router = useRouter()
const users = ref([])
const currentUser = ref(null)
const posts = ref([])
const feedEl = ref(null)
const defaultAvatar = '/vite.svg'
// profile edit state
const openProfileModal = ref(false)
const profileName = ref('')
const profileBio = ref('')
const profileAvatar = ref(null)
const profilePreview = ref('')
// user info modal
const openUserModal = ref(false)
const selectedUserId = ref(null)
const selectedUser = computed(() => users.value.find(u => u.id === selectedUserId.value))
const userPostCount = computed(() => posts.value.filter(p => p.userId === selectedUserId.value).length)
const userCommentCount = computed(() => posts.value.reduce((acc, p) => acc + (p.comments ? p.comments.filter(c => c.userId === selectedUserId.value).length : 0), 0))
// -- komentáře --
const commentInputs = ref({})
const activeCommentId = ref(null)
function toggleComment(postId) {
  activeCommentId.value = activeCommentId.value === postId ? null : postId
}
function addComment(post) {
  if (!commentInputs.value[post.id]) return
  if (!post.comments) post.comments = []
  post.comments.push({
    id: Date.now(),
    username: currentUser.value.username,
    userId: currentUser.value.id,
    text: commentInputs.value[post.id],
  })
  commentInputs.value[post.id] = ''
}
// LIKE
function likePost(post) {
  if (!post.likes) post.likes = []
  const i = post.likes.indexOf(currentUser.value.id)
  if (i === -1) post.likes.push(currentUser.value.id)
  else post.likes.splice(i, 1)
}
function logout() {
  localStorage.removeItem('shitpostr_current_user')
  currentUser.value = null
  openPostForm.value = false
  router.replace('/')
}
const deleteModalPostId = ref(null)
function deletePost(post) {
  deleteModalPostId.value = post.id
}
function confirmDeletePost() {
  const idx = posts.value.findIndex(p => p.id === deleteModalPostId.value)
  if (idx !== -1) {
    posts.value.splice(idx, 1)
  }
  deleteModalPostId.value = null
}
function closeDeleteModal() {
  deleteModalPostId.value = null
}
const openPostForm = ref(false)
const postCaption = ref('')
const postImage = ref(null)
const previewImg = ref('')
function onImageChange(e) {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = ev => {
      previewImg.value = ev.target.result
      postImage.value = ev.target.result // base64 string
    }
    reader.readAsDataURL(file)
  } else {
    previewImg.value = ''
    postImage.value = null
  }
}
function addPost() {
  if (!postCaption.value && !postImage.value) return
  posts.value.push({
    id: Date.now(),
    userId: currentUser.value.id,
    text: postCaption.value,
    imageUrl: postImage.value,
    type: 'post',
    likes: [],
    comments: [],
  })
  postCaption.value = ''
  postImage.value = null
  previewImg.value = ''
  openPostForm.value = false
}
const postsSorted = computed(() => [...posts.value].sort((a, b) => a.id - b.id))

onMounted(async () => {
  // load users
  const userStore = localStorage.getItem(LOCAL_USERS)
  if (userStore) {
    users.value = JSON.parse(userStore)
  }
  // load current user
  const curr = localStorage.getItem('shitpostr_current_user')
  if (curr) {
    currentUser.value = JSON.parse(curr)
    if (!currentUser.value.avatarUrl) currentUser.value.avatarUrl = ''
    if (!currentUser.value.bio) currentUser.value.bio = ''
  } else {
    router.replace('/')
    return
  }
  // load posts
  const saved = localStorage.getItem(LOCAL_POSTS)
  if (saved) {
    posts.value = JSON.parse(saved)
  } else {
    posts.value = []
  }
  await nextTick()
  scrollToBottom()
})
watch(openProfileModal, (open) => {
  if (open && currentUser.value) {
    profileName.value = currentUser.value.username || ''
    profileBio.value = currentUser.value.bio || ''
    profilePreview.value = ''
    profileAvatar.value = null
  }
})
function closeProfileModal() {
  openProfileModal.value = false
}
function onProfileAvatarChange(e) {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = ev => {
      profilePreview.value = ev.target.result
      profileAvatar.value = ev.target.result
    }
    reader.readAsDataURL(file)
  } else {
    profilePreview.value = ''
    profileAvatar.value = null
  }
}
function saveProfile() {
  if (!currentUser.value) return
  const updated = {
    ...currentUser.value,
    username: profileName.value || currentUser.value.username,
    bio: profileBio.value || '',
    avatarUrl: profileAvatar.value != null ? profileAvatar.value : currentUser.value.avatarUrl || ''
  }
  currentUser.value = updated
  localStorage.setItem('shitpostr_current_user', JSON.stringify(updated))
  // update in users list
  const idx = users.value.findIndex(u => u.id === updated.id)
  if (idx !== -1) {
    users.value[idx] = { ...users.value[idx], username: updated.username, bio: updated.bio, avatarUrl: updated.avatarUrl }
  }
  localStorage.setItem(LOCAL_USERS, JSON.stringify(users.value))
  openProfileModal.value = false
}
function openUserInfo(userId) {
  selectedUserId.value = userId
  openUserModal.value = true
}
function closeUserInfo() {
  openUserModal.value = false
}
// Redirect when user logs out (no flash message)
watch(currentUser, (val) => {
  if (!val) router.replace('/')
})
// Funkce pro scrollování na spodek feedu
function scrollToBottom() {
  if(feedEl.value) {
    feedEl.value.scrollTop = feedEl.value.scrollHeight
  }
}
watch(posts, async () => {
  localStorage.setItem(LOCAL_POSTS, JSON.stringify(posts.value))
  await nextTick()
  scrollToBottom()
}, { deep: true })
</script>

<style scoped>
.main-feed {
  display: flex;
  height: 100vh;
  background: #432910;
}
.sidebar {
  width: 250px;
  background: #f7ddb1;
  border-radius: 40px;
  margin: 32px 0 32px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
}
.sidebar-top {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 16px;
  margin-top: auto;
}
.logout-btn {
  background: #fff;
  border: none;
  border-radius: 12px;
  padding: 8px 12px;
  font-weight: bold;
  color: #432910;
  cursor: pointer;
}
.logout-btn:hover { background: #e6c690; }
/* header and logo removed */
.profile-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px 16px 0 16px;
  box-sizing: border-box;
}
.profile-avatar {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e6c690;
  background: #fff;
}
.profile-name {
  font-weight: bold;
  color: #432910;
  font-size: 1.05rem;
}
.profile-bio {
  color: #6b4619;
  font-size: 0.95rem;
  text-align: center;
}
.profile-actions { display: flex; gap: 8px; }
.profile-btn {
  background: #fff;
  border: none;
  border-radius: 10px;
  padding: 6px 10px;
  font-weight: bold;
  color: #432910;
  cursor: pointer;
}
.profile-btn.alt { background: #ffc262; }
.profile-btn:hover { background: #e6c690; }
.profile-edit-avatar img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e6c690;
  background: #fff;
}
.profile-edit-actions { display: flex; gap: 12px; align-items: center; }
.feed-author-row { display: flex; align-items: center; gap: 8px; }
.feed-author-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #f0d9a6;
  background: #fff;
}
.user-link {
  background: none;
  border: none;
  padding: 0;
  color: #6b4619;
  cursor: pointer;
}
.user-link:hover { text-decoration: underline; }
.modal-user {
  background: #fff;
  color: #432910;
  border-radius: 18px;
  box-shadow: 0 6px 30px #0008;
  padding: 26px 30px 22px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 320px;
}
.user-modal-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e6c690;
  background: #fff;
}
.user-modal-name { font-weight: bold; margin-top: 10px; font-size: 1.2rem; }
.user-modal-bio { margin-top: 6px; color: #6b4619; text-align: center; }
.user-modal-stats { display: flex; gap: 18px; margin-top: 14px; }
.user-modal-stats .stat-item { display: flex; flex-direction: column; align-items: center; }
.user-modal-stats .stat-item span { font-size: 0.9rem; color: #6b4619; }
.user-modal-stats .stat-item b { font-size: 1.1rem; color: #432910; }
.user-modal-stats .stat-item.total b { color: #000; }
/* header title removed */
.user-list {
  width: 100%;
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 30px;
}
.user-list li {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 9px 22px;
  border-radius: 28px;
  transition: background .2s;
  cursor: pointer;
}
.user-list li.active, .user-list li:hover {
  background: #e6c690;
}
.user-name {
  font-size: 1.1rem;
  color: #372102;
}

.feed-section {
  flex: 1;
  margin: 32px;
  background: #fce2b4;
  border-radius: 40px;
  padding: 24px 25px 16px 25px;
  display: flex;
  flex-direction: column;
}
.feed-header {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 38px;
  justify-content: flex-start;
}
.insta-feed {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 34px;
  overflow-y: auto;
  margin-bottom: 16px;
  align-items: center;
  max-height: 82vh;
}
.feed-post {
  background: #fff;
  border-radius: 17px;
  box-shadow: 0 2px 10px #c59f6677;
  padding: 18px 16px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 9px;
  min-width: 270px;
  max-width: 330px;
  width: 100%;
  border: 1px solid #f7eacc;
  margin: 0 auto;
  /* default centering - will be overridden below */
}
.own-post {
  align-self: flex-start;
  margin-left: 80px;
  margin-right: auto;
}
.other-post {
  align-self: flex-end;
  margin-right: 80px;
  margin-left: auto;
}
.feed-author {
  color: #83662e;
  font-weight: bold;
  font-size: 1.10rem;
  margin-bottom: 2px;
}
.feed-post-img {
  max-width: 270px;
  border-radius: 9px;
  margin-bottom: 6px;
  box-shadow: 0 2px 6px #dab39d33;
}
.feed-caption {
  background: #ffecd1;
  color: #432910;
  border-radius: 18px;
  padding: 9px 17px;
  font-size: 1.04rem;
  margin-bottom: 2px;
  box-shadow: 0 2px 4px #ffddb122;
}
.feed-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 2px 0 1px 0;
}
.like-btn {
  background: none;
  border: none;
  font-size: 1.16rem;
  cursor: pointer;
  color: #de3824;
  margin-right: 7px;
}
.like-btn.liked { filter: brightness(1.13) drop-shadow(0 0 5px #fc0a); }
.feed-comments {
  margin-top: 6px;
  padding-top: 5px;
  border-top: 1px solid #f5e1b8;
  font-size: 0.96rem;
}
.single-comment {
  margin-bottom: 2px;
}
.c-author {
  color: #6b4619;
  font-weight: bold;
}
.comment-form {
  display: flex;
  gap: 7px;
  margin-top: 5px;
}
.comment-form input {
  flex: 1;
  border-radius: 9px;
  padding: 6px 7px;
  border: 1px solid #dac08c;
  font-size: 1.01rem;
}
.com-btn {
  border: none;
  border-radius: 7px;
  padding: 2px 11px;
  color: #fff;
  background: #ffc262;
  font-size: 0.99rem;
  font-weight: bold;
  cursor: pointer;
}
.com-btn:hover { background: #ffd28b; color: #442507; }
.add-post-btn {
  margin-top: 35px;
  padding: 11px 15px;
  font-size: 1.04rem;
  background: #fff;
  border-radius: 13px;
  border: none;
  color: #432910;
  font-weight: bold;
  cursor: pointer;
  transition: background .18s;
}
.add-post-btn:hover { background: #e6c690; }
.modal-post-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 22;
  background: #0006;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-post {
  background: #fce2b4;
  border-radius: 25px;
  box-shadow: 0 0 18px #0006;
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 330px;
  min-height: 250px;
  align-items: center;
}
.modal-post textarea {
  width: 100%;
  border-radius: 8px;
  padding: 9px;
  border: 1px solid #dfbe99;
  font-size: 1.1rem;
  resize: vertical;
  margin-bottom: 8px;
}
.post-btn {
  font-size: 1.1rem;
  background: #ffc262;
  border-radius: 8px;
  font-weight: bold;
  padding: 8px 19px;
  border: none;
  color: #432910;
  cursor: pointer;
  margin-right: 16px;
}
.close-btn {
  background: none;
  color: #ad0000;
  border: none;
  font-weight: bold;
  cursor: pointer;
}
.preview img {
  max-width: 140px;
  max-height: 140px;
  border-radius: 13px;
  margin-top: 6px;
  box-shadow: 0 0 5px #2224;
}
.bubble-instapost {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}
.bubble-instapost img.insta-img {
  max-width: 230px;
  border-radius: 13px;
  margin-bottom: 6px;
}
.bubble-instapost .insta-caption {
  background: #ffecd1;
  color: #432910;
  border-radius: 22px;
  padding: 8px 23px;
  font-size: 1.1rem;
  margin-bottom: 4px;
}
.chat-btn {
  margin-left: 7px;
  padding: 3px 15px 3px 11px;
  font-size: 1.22rem;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #432910;
  transition: background .15s;
}
.chat-btn:hover {
  background: #f8f8f8;
  color: #332210;
}
.comment-form {
  display: flex;
  gap: 9px;
  margin-top: 7px;
}
.comment-form[style*="display: none"] {
  display: none !important;
}
.delete-btn {
  background: none;
  border: none;
  font-size: 1.22rem;
  cursor: pointer;
  color: #ad0000;
  margin-left: auto;
  border-radius: 8px;
  padding: 3px 7px;
  transition: background .15s;
  order: 99;
  align-self: flex-end;
}
.delete-btn:hover {
  background: #fff0f0;
  color: #fff;
}
.modal-delete-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 100;
  background: #0007;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-delete {
  background: #fff;
  color: #432910;
  border-radius: 18px;
  box-shadow: 0 6px 30px #0008;
  padding: 34px 38px 28px 38px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 290px;
}
.modal-delete-title {
  font-size: 1.18rem;
  font-weight: bold;
  margin-bottom: 18px;
}
.modal-delete-actions {
  display: flex;
  gap: 22px;
  margin-top: 10px;
}
.delete-final-btn {
  padding: 7px 26px;
  font-size: 1rem;
  background: #e6c690;
  border: none;
  border-radius: 11px;
  font-weight: bold;
  color: #432910;
  transition: background .18s, color .18s;
  cursor: pointer;
}
.delete-final-btn.delete-danger {
  background: #f77b74;
  color: #fff;
}
.delete-final-btn:hover { background: #ffc262; color: #201000; }
.delete-final-btn.delete-danger:hover { background: #d65440; color: #fff; }
</style>
