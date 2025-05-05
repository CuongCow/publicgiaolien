import React, { useState, useEffect, useRef } from 'react';
import { Button, Badge, ListGroup, Form, InputGroup } from 'react-bootstrap';
import { authApi } from '../services/api';
import io from 'socket.io-client';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import './ChatButton.css';

// Địa chỉ server socket
const SOCKET_SERVER = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Đường dẫn tới âm thanh thông báo
const MESSAGE_SOUND = '/sounds/message.mp3';

// Component biểu thị trạng thái online
const OnlineIndicator = ({ isOnline, size = '' }) => (
  isOnline && <div className={`online-indicator ${size}`}></div>
);

// Avatar component
const UserAvatar = ({ username, size = 40 }) => (
  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
       style={{ width: `${size}px`, height: `${size}px` }}>
    <span>{username?.charAt(0).toUpperCase()}</span>
  </div>
);

// Role badge component
const RoleBadge = ({ role }) => {
  if (role === 'superadmin') {
    return <Badge bg="danger" className="ms-1" style={{ fontSize: '0.7rem' }}>Super</Badge>;
  } else if (role === 'admin') {
    return <Badge bg="primary" className="ms-1" style={{ fontSize: '0.7rem' }}>Admin</Badge>;
  }
  return null;
};

const ChatButton = () => {
  // State management
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentContact, setCurrentContact] = useState(null);
  const [socket, setSocket] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const chatContainerRef = useRef(null);
  const audioRef = useRef(new Audio(MESSAGE_SOUND));
  const [isDocumentFocused, setIsDocumentFocused] = useState(true);
  const [previewMessages, setPreviewMessages] = useState([]);
  
  // Theo dõi trạng thái focus của trang
  useEffect(() => {
    const handleFocus = () => setIsDocumentFocused(true);
    const handleBlur = () => setIsDocumentFocused(false);
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);
  
  // Kết nối socket khi component mount
  useEffect(() => {
    const newSocket = io(SOCKET_SERVER);
    setSocket(newSocket);
    
    const fetchCurrentUser = async () => {
      try {
        const res = await authApi.getMe();
        setCurrentUser(res.data);
        
        newSocket.emit('user_login', {
          userId: res.data._id,
          username: res.data.username,
          role: res.data.role
        });
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    
    fetchCurrentUser();
    
    return () => {
      newSocket.disconnect();
    };
  }, []);
  
  // Xử lý các event socket
  useEffect(() => {
    if (!socket) return;
    
    // Nhận tin nhắn mới
    socket.on('receive_message', (data) => {
      const newMessage = {
        sender: data.from,
        senderName: data.fromUsername,
        content: data.message,
        timestamp: data.timestamp,
        isFromCurrentUser: false,
        isAutoReply: data.isAutoReply || false
      };
      
      setChatMessages(prev => [...prev, newMessage]);
      
      // Kiểm tra xem có cần tăng số tin nhắn chưa đọc không
      if (!currentContact || currentContact._id !== data.from) {
        setUnreadMessages(prev => prev + 1);
        
        // Thêm tin nhắn vào danh sách xem trước
        setPreviewMessages(prev => {
          const newList = [newMessage, ...prev.filter(msg => msg.sender !== data.from)];
          return newList.slice(0, 2); // Chỉ giữ 2 tin nhắn gần nhất
        });
        
        // Phát âm thanh thông báo
        playNotificationSound();
        
        // Hiển thị Desktop notification nếu trang không được focus
        if (!isDocumentFocused) {
          showDesktopNotification(data.fromUsername || 'Admin', data.message);
        }
      }
    });
    
    // Cập nhật trạng thái người dùng online
    socket.on('user_status_change', (data) => {
      setOnlineUsers(prev => ({
        ...prev,
        [data.userId]: data.status
      }));
    });
    
    // Nhận danh sách người dùng online
    socket.on('online_users', (users) => {
      const onlineStatus = {};
      users.forEach(user => {
        onlineStatus[user.userId] = true;
      });
      setOnlineUsers(onlineStatus);
    });
    
    return () => {
      socket.off('receive_message');
      socket.off('user_status_change');
      socket.off('online_users');
    };
  }, [socket, currentContact, isDocumentFocused]);
  
  // Hàm phát âm thanh thông báo
  const playNotificationSound = () => {
    try {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.warn('Cannot play audio:', error);
      });
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };
  
  // Hàm hiển thị Desktop notification
  const showDesktopNotification = (sender, content) => {
    // Kiểm tra hỗ trợ Desktop notification
    if (!("Notification" in window)) {
      console.warn("Trình duyệt này không hỗ trợ desktop notifications");
      return;
    }
    
    // Kiểm tra quyền thông báo
    if (Notification.permission === "granted") {
      createNotification(sender, content);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          createNotification(sender, content);
        }
      });
    }
  };
  
  // Tạo thông báo
  const createNotification = (sender, content) => {
    const notification = new Notification("Tin nhắn mới từ " + sender, {
      body: content,
      icon: "/favicon.ico"
    });
    
    notification.onclick = () => {
      window.focus();
      setShowChat(true);
      notification.close();
    };
    
    // Tự động đóng sau 5 giây
    setTimeout(() => notification.close(), 5000);
  };
  
  // Auto-scroll xuống dưới cùng khi có tin nhắn mới
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);
  
  // Đánh dấu tin nhắn đã đọc khi chọn người dùng
  useEffect(() => {
    if (currentContact) {
      markMessagesAsRead(currentContact._id);
      // Xóa tin nhắn xem trước từ người dùng đã chọn
      setPreviewMessages(prev => prev.filter(msg => msg.sender !== currentContact._id));
    }
  }, [currentContact]);
  
  // Lấy danh sách liên hệ và tin nhắn khi hiển thị chat
  useEffect(() => {
    if (showChat && currentUser) {
      fetchContacts();
      fetchUnreadCount();
    }
  }, [showChat, currentUser]);
  
  // Lọc danh sách liên hệ khi searchTerm thay đổi
  useEffect(() => {
    if (contacts.length > 0) {
      if (!searchTerm.trim()) {
        setFilteredContacts(contacts);
      } else {
        const term = searchTerm.toLowerCase();
        const filtered = contacts.filter(contact => 
          contact.username.toLowerCase().includes(term) || 
          (contact.name && contact.name.toLowerCase().includes(term))
        );
        setFilteredContacts(filtered);
      }
    } else {
      setFilteredContacts([]);
    }
  }, [contacts, searchTerm]);
  
  // API calls
  const fetchContacts = async () => {
    try {
      // Lấy danh sách liên hệ đã có cuộc trò chuyện
      const res = await fetch(`${SOCKET_SERVER}/api/chat/contacts`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      const chatContacts = await res.json();
      
      // Lấy danh sách tất cả admin
      const adminsRes = await fetch(`${SOCKET_SERVER}/api/auth/admins`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      try {
        let allAdmins = await adminsRes.json();
        
        // Loại bỏ người dùng hiện tại khỏi danh sách
        allAdmins = allAdmins.filter(admin => admin._id !== currentUser._id);
        
        // Tạo map ID -> Đã có chat hay chưa
        const existingContactIds = new Set(chatContacts.map(contact => contact._id.toString()));
        
        // Kết hợp danh sách
        const combinedContacts = [...chatContacts];
        
        // Thêm các admin chưa có trong danh sách chat
        allAdmins.forEach(admin => {
          if (!existingContactIds.has(admin._id.toString())) {
            combinedContacts.push({
              _id: admin._id,
              username: admin.username,
              role: admin.role,
              name: admin.name,
              lastMessage: 'Bắt đầu cuộc trò chuyện',
              lastMessageTime: new Date().toISOString(),
              isNewContact: true
            });
          }
        });
        
        // Sắp xếp: đầu tiên là các liên hệ đã có chat, sau đó là các liên hệ mới
        combinedContacts.sort((a, b) => {
          if (a.isNewContact && !b.isNewContact) return 1;
          if (!a.isNewContact && b.isNewContact) return -1;
          return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
        });
        
        setContacts(combinedContacts);
        
        // Nếu chưa chọn người dùng và có danh sách liên hệ, chọn người đầu tiên
        if (!currentContact && combinedContacts.length > 0) {
          handleSelectContact(combinedContacts[0]);
        }
      } catch (adminError) {
        console.error('Error parsing admin list:', adminError);
        setContacts(chatContacts);
        
        if (!currentContact && chatContacts.length > 0) {
          handleSelectContact(chatContacts[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };
  
  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`${SOCKET_SERVER}/api/chat/unread`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      const data = await res.json();
      setUnreadMessages(data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };
  
  const fetchMessages = async (userId) => {
    try {
      const res = await fetch(`${SOCKET_SERVER}/api/chat/messages/${userId}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      const data = await res.json();
      
      // Chuyển đổi tin nhắn sang định dạng hiển thị
      const formattedMessages = data.map(msg => ({
        id: msg._id,
        sender: msg.sender._id,
        senderName: msg.sender.username,
        content: msg.message,
        timestamp: msg.createdAt,
        isFromCurrentUser: msg.sender._id === currentUser._id
      }));
      
      setChatMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };
  
  const markMessagesAsRead = async (senderId) => {
    try {
      await fetch(`${SOCKET_SERVER}/api/chat/read/${senderId}`, {
        method: 'PUT',
        headers: {
          'x-auth-token': localStorage.getItem('token'),
          'Content-Type': 'application/json'
        }
      });
      
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };
  
  const saveMessageToDb = async (recipientId, messageText) => {
    try {
      await fetch(`${SOCKET_SERVER}/api/chat/message`, {
        method: 'POST',
        headers: {
          'x-auth-token': localStorage.getItem('token'),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient: recipientId,
          message: messageText
        })
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };
  
  // Event handlers
  const handleSelectContact = (contact) => {
    setCurrentContact(contact);
    fetchMessages(contact._id);
  };
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!message.trim() || !currentContact || !socket) return;
    
    const timestamp = new Date().toISOString();
    
    socket.emit('send_message', {
      to: currentContact._id,
      message: message.trim(),
      timestamp
    });
    
    saveMessageToDb(currentContact._id, message.trim());
    
    setChatMessages(prev => [...prev, {
      sender: currentUser._id,
      senderName: currentUser.username,
      content: message.trim(),
      timestamp,
      isFromCurrentUser: true
    }]);
    
    setMessage('');
  };
  
  // Helpers
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'HH:mm, dd/MM/yyyy', { locale: vi });
  };
  
  // Render components
  const renderEmptyContactList = () => {
    if (searchTerm.trim() && contacts.length > 0) {
      return (
        <ListGroup.Item className="text-center py-3">
          <i className="bi bi-search me-2"></i>
          Không tìm thấy kết quả
        </ListGroup.Item>
      );
    }
    
    const isSuperAdmin = currentUser?.role === 'superadmin';
    return (
      <ListGroup.Item className="text-center py-3">
        <i className="bi bi-chat-left-text me-2"></i>
        <div>Không có cuộc trò chuyện nào</div>
        <small className="d-block text-muted mt-2">
          {isSuperAdmin 
            ? 'Bạn có thể trò chuyện với bất kỳ admin nào' 
            : 'Bạn chỉ có thể trò chuyện với superadmin'}
        </small>
      </ListGroup.Item>
    );
  };

  const renderContacts = () => {
    if (filteredContacts.length === 0) {
      return renderEmptyContactList();
    }
    
    return filteredContacts.map((contact) => (
      <ListGroup.Item
        key={contact._id}
        action
        active={currentContact && currentContact._id === contact._id}
        className="d-flex align-items-center contact-item"
        onClick={() => handleSelectContact(contact)}
      >
        <div className="position-relative me-2">
          <UserAvatar username={contact.username} />
          <OnlineIndicator isOnline={onlineUsers[contact._id]} />
        </div>
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-center">
            <div className="fw-bold">
              {contact.username}
              <RoleBadge role={contact.role} />
            </div>
          </div>
          <div className="text-muted small text-truncate" style={{ maxWidth: '200px' }}>
            {contact.lastMessage}
          </div>
        </div>
      </ListGroup.Item>
    ));
  };
  
  const renderEmptyChat = () => {
    const isNewContact = currentContact?.isNewContact;
    
    return (
      <div className="text-center text-muted my-4">
        <i className={`bi ${isNewContact ? 'bi-chat-square-text' : 'bi-chat-square-dots'} fs-3 mb-2`}></i>
        <p>{isNewContact ? 'Bắt đầu cuộc trò chuyện mới' : 'Bắt đầu cuộc trò chuyện'}</p>
        {isNewContact && (
          <p className="small text-muted px-3">
            Đây là liên hệ mới. Hãy gửi tin nhắn để bắt đầu trò chuyện.
          </p>
        )}
      </div>
    );
  };

  const renderMessages = () => {
    if (chatMessages.length === 0) {
      return renderEmptyChat();
    }
    
    return chatMessages.map((msg, index) => (
      <div
        key={index}
        className={`message-item ${msg.isFromCurrentUser ? 'message-sent' : 'message-received'}`}
      >
        <div className={`message-content ${msg.isAutoReply ? 'auto-reply' : ''}`}>
          {msg.isAutoReply && (
            <div className="auto-reply-badge">
              <i className="bi bi-robot me-1"></i>
              Trả lời tự động
            </div>
          )}
          <div className="message-sender">
            {!msg.isFromCurrentUser && `${msg.senderName}`}
          </div>
          <div className="message-text">{msg.content}</div>
          <div className="message-time">{formatTime(msg.timestamp)}</div>
        </div>
      </div>
    ));
  };
  
  const renderChatHeader = () => (
    <div className="chat-main-header d-flex justify-content-between align-items-center p-2 border-bottom">
      <div className="d-flex align-items-center">
        <div className="position-relative me-2">
          <UserAvatar username={currentContact.username} size={32} />
          <OnlineIndicator isOnline={onlineUsers[currentContact._id]} size="small" />
        </div>
        <div>
          <div className="fw-bold">
            {currentContact.username}
            <RoleBadge role={currentContact.role} />
          </div>
          <div className="text-muted small">
            {onlineUsers[currentContact._id] ? 'Đang hoạt động' : 'Không hoạt động'}
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderChatInput = () => (
    <div className="chat-input p-2 border-top">
      <Form onSubmit={handleSendMessage}>
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Nhập tin nhắn..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            autoFocus
          />
          <Button
            variant="primary"
            type="submit"
            disabled={!message.trim()}
          >
            <i className="bi bi-send-fill"></i>
          </Button>
        </InputGroup>
      </Form>
    </div>
  );
  
  const renderEmptyState = () => (
    <div className="chat-empty-state d-flex flex-column align-items-center justify-content-center h-100">
      <i className="bi bi-chat-square-text fs-1 mb-3 text-primary"></i>
      <h5>Chọn một liên hệ để bắt đầu trò chuyện</h5>
      {currentUser?.role === 'superadmin' ? (
        <p className="text-muted">Bạn có thể trò chuyện với bất kỳ admin nào</p>
      ) : (
        <p className="text-muted">Bạn có thể trò chuyện với superadmin</p>
      )}
      {contacts.length === 0 ? (
        <div className="text-center mt-2">
          <p className="small text-muted">Đang tải danh sách liên hệ...</p>
          <div className="spinner-border spinner-border-sm text-primary mt-2" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      ) : (
        <div className="text-center mt-2">
          <p className="small text-muted">
            Hãy chọn một người từ danh sách liên hệ ở bên trái để bắt đầu
          </p>
        </div>
      )}
    </div>
  );
  
  // Render popup xem trước khi hover
  const renderPreviewPopup = () => {
    if (previewMessages.length === 0) return null;
    
    return (
      <div className="chat-preview-popup">
        <div className="chat-preview-header">
          <strong>Tin nhắn chưa đọc</strong>
        </div>
        {previewMessages.map((msg, index) => {
          // Tìm thông tin người gửi
          const senderContact = contacts.find(c => c._id === msg.sender) || {};
          return (
            <div key={index} className="chat-preview-item" onClick={() => handleSelectContact(senderContact)}>
              <div className="chat-preview-sender">
                {senderContact.name || senderContact.username || 'Admin'}
              </div>
              <div className="chat-preview-content">
                {msg.content?.length > 30 ? msg.content.substring(0, 30) + '...' : msg.content}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="chat-widget-container">
      <div className="chat-button-wrapper" onMouseEnter={() => unreadMessages > 0 && !showChat}>
        <Button
          variant="link"
          className={`chat-button p-0 text-dark ${showChat ? 'active' : ''}`}
          onClick={() => setShowChat(!showChat)}
          style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
        >
          <i className="bi bi-chat-dots fs-4"></i>
          {unreadMessages > 0 && (
            <Badge 
              bg="danger" 
              className="notification-badge"
              style={{ 
                position: 'absolute', 
                top: '-5px', 
                right: '-5px', 
                fontSize: '0.7rem',
                minWidth: '18px', 
                height: '18px' 
              }}
            >
              {unreadMessages > 9 ? '9+' : unreadMessages}
            </Badge>
          )}
        </Button>
        
        {unreadMessages > 0 && !showChat && renderPreviewPopup()}
      </div>
      
      {showChat && (
        <div className="chat-dropdown">
          <div className="chat-header">
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <h5 className="mb-0">Chat</h5>
              <Button
                variant="link"
                className="p-0 text-dark"
                onClick={() => setShowChat(false)}
              >
                <i className="bi bi-x-lg"></i>
              </Button>
            </div>
          </div>
          
          <div className="chat-content">
            <div className="chat-sidebar">
              <div className="chat-contacts-header">
                <div className="p-2 d-flex justify-content-between align-items-center border-bottom">
                  <h6 className="mb-0">Danh sách liên hệ</h6>
                </div>
                <Form className="p-2 border-bottom">
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm admin..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-control-sm"
                  />
                </Form>
              </div>
              <ListGroup variant="flush" className="contacts-list">
                {renderContacts()}
              </ListGroup>
            </div>
            
            <div className="chat-main">
              {currentContact ? (
                <>
                  {renderChatHeader()}
                  <div className="chat-messages" ref={chatContainerRef}>
                    {renderMessages()}
                  </div>
                  {renderChatInput()}
                </>
              ) : (
                renderEmptyState()
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatButton; 