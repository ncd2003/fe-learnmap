import { useState, useEffect } from 'react';
import { postApi } from '../../api/postApi';
import { commentApi } from '../../api/commentApi';
import PostDetailModal from './PostDetailModal';
import './TopicDetail.css';

function TopicDetail({ topic, user, onBack }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [postCommentCounts, setPostCommentCounts] = useState({});
  const [totalComments, setTotalComments] = useState(0);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
  });

  useEffect(() => {
    fetchPosts();
  }, [topic.id]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postApi.getPostsByTopicId(topic.id);
      if (response.statusCode === 200 && response.data) {
        // Sort posts by ID in descending order (newest first)
        const sortedPosts = response.data.sort((a, b) => b.id - a.id);
        setPosts(sortedPosts);
        
        // Fetch comment counts for each post
        const commentCounts = {};
        let total = 0;
        await Promise.all(
          sortedPosts.map(async (post) => {
            try {
              const commentsResponse = await commentApi.getCommentsByPostId(post.id);
              const count = commentsResponse.data?.length || 0;
              commentCounts[post.id] = count;
              total += count;
            } catch (err) {
              commentCounts[post.id] = 0;
            }
          })
        );
        setPostCommentCounts(commentCounts);
        setTotalComments(total);
      } else {
        setError(response.error || 'Không thể tải danh sách bài viết');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải dữ liệu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Vui lòng đăng nhập để tạo bài viết');
      return;
    }

    try {
      const postData = {
        title: newPost.title,
        content: newPost.content,
        topicId: topic.id,
      };

      await postApi.createPost(postData);
      setShowCreateModal(false);
      setNewPost({ title: '', content: '' });
      fetchPosts();
    } catch (err) {
      alert(err.error || err.message || 'Không thể tạo bài viết');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="topic-detail-page">
        <div className="topic-detail-header">
          <button className="btn-back" onClick={onBack}>← Quay lại</button>
          <h1>{topic.title}</h1>
        </div>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="topic-detail-page">
        <div className="topic-detail-header">
          <button className="btn-back" onClick={onBack}>← Quay lại</button>
          <h1>{topic.title}</h1>
        </div>
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="topic-detail-page">
      <div className="topic-detail-header">
        <button className="btn-back" onClick={onBack}>← Quay lại diễn đàn</button>
        <div className="topic-info"></div>
        <div className="topic-info">
          <h1>📌 {topic.title}</h1>
          <p className="topic-description">{topic.description}</p>
        </div>
        {user && (
          <button className="btn-create-post" onClick={() => setShowCreateModal(true)}>
            ✏️ Tạo bài viết mới
          </button>
        )}
      </div>

      <div className="topic-detail-container">
        <div className="posts-stats">
          <div className="stat-item">
            <span className="stat-number">{posts.length}</span>
            <span className="stat-label">Bài viết</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{totalComments}</span>
            <span className="stat-label">Bình luận</span>
          </div>
        </div>

        <div className="posts-list">
          {posts.length === 0 ? (
            <div className="no-posts">
              <p>Chưa có bài viết nào trong chủ đề này. Hãy là người đầu tiên viết bài!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-avatar">
                  <div className="avatar-circle">
                    {post.account?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                </div>
                <div className="post-content">
                  <div className="post-header">
                    <h3 className="post-title">{post.title}</h3>
                    <span className="post-author">bởi {post.account || 'Ẩn danh'}</span>
                  </div>
                  <p className="post-excerpt">
                    {post.content && post.content.length > 200 
                      ? post.content.substring(0, 200) + '...' 
                      : post.content}
                  </p>
                  <div className="post-footer">
                    <div className="post-meta">
                      <span className="post-stat">💬 {postCommentCounts[post.id] || 0} bình luận</span>
                    </div>
                    <button className="btn-view-post" onClick={() => setSelectedPost(post)}>
                      Xem chi tiết →
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          user={user}
          onClose={() => setSelectedPost(null)}
        />
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Tạo bài viết mới</h2>
              <button className="btn-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreatePost}>
              <div className="form-group">
                <label htmlFor="title">Tiêu đề bài viết *</label>
                <input
                  type="text"
                  id="title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="Nhập tiêu đề bài viết..."
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="content">Nội dung *</label>
                <textarea
                  id="content"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Viết nội dung bài viết của bạn..."
                  rows="8"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  Đăng bài
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TopicDetail;
