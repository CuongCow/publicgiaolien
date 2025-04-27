// Dịch vụ Mixpanel để quản lý phân tích người dùng
const trackUserActivity = (teamId, teamName, action, data = {}) => {
  if (!window.mixpanel) {
    console.warn('Mixpanel not available');
    return;
  }

  try {
    // Gửi sự kiện với thông tin đội
    window.mixpanel.track(action, {
      teamId,
      teamName,
      ...data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error tracking Mixpanel event:', error);
  }
};

// Ghi lại sự kiện truy cập trang
export const trackPageView = (teamId, teamName, page) => {
  trackUserActivity(teamId, teamName, 'page_view', { page });
};

// Ghi lại sự kiện nộp đáp án
export const trackAnswerSubmission = (teamId, teamName, stationId, stationName, isCorrect) => {
  trackUserActivity(teamId, teamName, 'submit_answer', {
    stationId,
    stationName,
    isCorrect
  });
};

// Ghi lại sự kiện sao chép nội dung
export const trackCopyContent = (teamId, teamName, content) => {
  trackUserActivity(teamId, teamName, 'copy_content', {
    content: content.substring(0, 100) // Giới hạn độ dài nội dung
  });
};

// Ghi lại trạng thái hoạt động: đang hoạt động, ẩn tab, thoát
export const trackActivityStatus = (teamId, teamName, status) => {
  trackUserActivity(teamId, teamName, 'activity_status_change', { status });
};

// Đăng ký người dùng với Mixpanel
export const identifyUser = (teamId, teamName) => {
  if (!window.mixpanel) {
    console.warn('Mixpanel not available');
    return;
  }

  try {
    // Thiết lập ID cho người dùng
    window.mixpanel.identify(teamId);
    
    // Thiết lập thông tin người dùng
    window.mixpanel.people.set({
      $name: teamName,
      team_id: teamId,
      first_seen: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error identifying user in Mixpanel:', error);
  }
};

export default {
  trackPageView,
  trackAnswerSubmission,
  trackCopyContent,
  trackActivityStatus,
  identifyUser
}; 