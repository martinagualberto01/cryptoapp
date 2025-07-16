export const solicitarPermissaoNotificacao = async () => {
  if ('Notification' in window) {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
};

export const enviarNotificacao = (titulo: string, corpo: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(titulo, { body: corpo });
  }
};