let currentApiKey = localStorage.getItem('apiKey') || '';
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

function updateAuthUI() {
  const authStatus = document.getElementById('authStatus');
  const apiKeyDisplay = document.getElementById('apiKeyDisplay');
  if (currentApiKey && currentUser) {
    authStatus.innerText = `👤 ${currentUser.userName} (${currentUser.email})`;
    apiKeyDisplay.innerText = currentApiKey;
  } else {
    authStatus.innerText = 'Chưa đăng nhập';
    apiKeyDisplay.innerText = 'Chưa có apiKey';
  }
}

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const userName = document.getElementById('regUserName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;

  const res = await fetch('/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userName, email, password })
  });
  const data = await res.json();
  alert(data.message);
  if (data.success) e.target.reset();
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const res = await fetch('/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  alert(data.message);
  if (data.success) {
    currentApiKey = data.apiKey;
    currentUser = data.user;
    localStorage.setItem('apiKey', currentApiKey);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateAuthUI();
  }
});

document.getElementById('createPostForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentApiKey) return alert('Bạn cần đăng nhập trước để nhận apiKey!');

  const content = document.getElementById('postContent').value;
  const res = await fetch(`/posts?apiKey=${encodeURIComponent(currentApiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
  const data = await res.json();
  alert(data.message);
  if (data.success) {
    document.getElementById('postContent').value = '';
    loadPosts();
  }
});

async function editPost(id, oldContent) {
  if (!currentApiKey) return alert('Bạn cần có apiKey để sửa bài!');
  const newContent = prompt('Cập nhật lại bài chia sẻ tiếng Trung:', oldContent);
  if (!newContent || newContent.trim() === oldContent) return;

  const res = await fetch(`/posts/${id}?apiKey=${encodeURIComponent(currentApiKey)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: newContent })
  });
  const data = await res.json();
  alert(data.message);
  if (data.success) loadPosts();
}

async function loadPosts() {
  const res = await fetch('/posts');
  const result = await res.json();
  const list = document.getElementById('postsList');
  list.innerHTML = '';

  if (!result.data || result.data.length === 0) {
    list.innerHTML = `<p class="text-sm text-slate-400">Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ!</p>`;
    return;
  }

  result.data.forEach(p => {
    const isOwner = currentUser && p.userId && (currentUser._id === p.userId._id || currentUser._id === p.userId);
    const card = document.createElement('div');
    card.className = 'bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-start';
    card.innerHTML = `
      <div class="space-y-1">
        <p class="font-medium text-slate-800">${p.content}</p>
        <p class="text-xs text-slate-400">Đăng bởi: <span class="font-semibold text-slate-600">${p.userId?.userName || 'Ẩn danh'}</span> | ${new Date(p.createdAt).toLocaleString('vi-VN')}</p>
      </div>
      ${isOwner ? `<button onclick="editPost('${p._id}', '${p.content.replace(/'/g, "\\'")}')" class="text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded transition ml-2">Sửa bài</button>` : ''}
    `;
    list.appendChild(card);
  });
}

updateAuthUI();
loadPosts();