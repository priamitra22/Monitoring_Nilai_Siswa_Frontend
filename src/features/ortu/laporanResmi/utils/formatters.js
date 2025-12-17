/**
 * Format file size from bytes to human-readable format
 */
export const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

/**
 * Format date to Indonesian locale
 */
export const formatDate = (date) => {
    if (!date) return '-';

    const d = new Date(date);

    const options = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    };

    return d.toLocaleDateString('id-ID', options);
};

/**
 * Format date to short format
 */
export const formatDateShort = (date) => {
    if (!date) return '-';

    const d = new Date(date);

    const options = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    };

    return d.toLocaleDateString('id-ID', options);
};

export default {
    formatFileSize,
    formatDate,
    formatDateShort,
};
