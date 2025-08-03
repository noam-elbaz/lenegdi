import { useState } from 'react';

export function useModal() {
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    buttons: [],
    showCancel: true,
    onClose: null
  });

  const showModal = (config) => {
    return new Promise((resolve) => {
      setModal({
        isOpen: true,
        title: config.title || 'Notice',
        message: config.message || '',
        type: config.type || 'info',
        buttons: config.buttons || [{ text: 'OK', type: 'primary' }],
        showCancel: config.showCancel !== false,
        onClose: (result) => {
          setModal(prev => ({ ...prev, isOpen: false }));
          resolve(result);
        }
      });
    });
  };

  const alert = (message, title = 'Notice') => {
    return showModal({
      title,
      message,
      type: 'info',
      buttons: [{ text: 'OK', type: 'primary' }],
      showCancel: false
    });
  };

  const confirm = (message, title = 'Confirm') => {
    return showModal({
      title,
      message,
      type: 'warning',
      buttons: [{ text: 'Confirm', type: 'danger', value: true }],
      showCancel: true
    });
  };

  const success = (message, title = 'Success') => {
    return showModal({
      title,
      message,
      type: 'success',
      buttons: [{ text: 'OK', type: 'success' }],
      showCancel: false
    });
  };

  const error = (message, title = 'Error') => {
    return showModal({
      title,
      message,
      type: 'error',
      buttons: [{ text: 'OK', type: 'danger' }],
      showCancel: false
    });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  return {
    modal,
    showModal,
    alert,
    confirm,
    success,
    error,
    closeModal
  };
}