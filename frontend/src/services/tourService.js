// Оновлений сервіс для роботи з турами через бекенд API

import apiService from './apiService';

// Отримати всі тури
export const getAllTours = async (filters = {}) => {
    try {
        const response = await apiService.tours.getAll(filters);
        return response.data || [];
    } catch (error) {
        console.error('Помилка при отриманні турів:', error);
        throw new Error('Не вдалося завантажити тури');
    }
};

// Отримати конкретний тур за ID
export const getTourById = async (tourId) => {
    try {
        const response = await apiService.tours.getById(tourId);
        return response.data;
    } catch (error) {
        console.error(`Помилка при отриманні туру ${tourId}:`, error);
        throw new Error('Не вдалося завантажити тур');
    }
};

// Отримати відгуки для туру
export const getReviewsForTour = async (tourId) => {
    try {
        const response = await apiService.reviews.getForTour(tourId);
        return response.data || [];
    } catch (error) {
        console.error(`Помилка при отриманні відгуків для туру ${tourId}:`, error);
        throw new Error('Не вдалося завантажити відгуки');
    }
};

// Додати відгук до туру
export const addReview = async (tourId, userId, userName, text, rating) => {
    try {
        const reviewData = {
            text,
            rating
        };

        const response = await apiService.reviews.add(tourId, reviewData);
        return response.data;
    } catch (error) {
        console.error('Помилка при додаванні відгуку:', error);
        throw new Error('Не вдалося додати відгук');
    }
};

// Забронювати тур
export const bookTour = async (tourId, userId, bookingData) => {
    try {
        const booking = {
            tourId,
            ...bookingData
        };

        const response = await apiService.bookings.create(booking);
        return response.data.id;
    } catch (error) {
        console.error('Помилка при бронюванні туру:', error);
        throw new Error('Не вдалося забронювати тур');
    }
};

// Отримати бронювання користувача
export const getUserBookings = async (userId) => {
    try {
        const response = await apiService.bookings.getMy();
        return response.data || [];
    } catch (error) {
        console.error('Помилка при отриманні бронювань:', error);
        throw new Error('Не вдалося завантажити бронювання');
    }
};

// Додати тур до улюблених
export const addToFavorites = async (tourId) => {
    try {
        const response = await apiService.favorites.add(tourId);
        return response.data;
    } catch (error) {
        console.error('Помилка при додаванні до улюблених:', error);
        throw new Error('Не вдалося додати до улюблених');
    }
};

// Видалити тур з улюблених
export const removeFromFavorites = async (tourId) => {
    try {
        await apiService.favorites.remove(tourId);
        return true;
    } catch (error) {
        console.error('Помилка при видаленні з улюблених:', error);
        throw new Error('Не вдалося видалити з улюблених');
    }
};

// Отримати улюблені тури
export const getFavoriteTours = async () => {
    try {
        const response = await apiService.favorites.getAll();
        return response.data || [];
    } catch (error) {
        console.error('Помилка при отриманні улюблених турів:', error);
        throw new Error('Не вдалося завантажити улюблені тури');
    }
};

// Перевірити чи тур в улюблених
export const isTourFavorite = async (tourId) => {
    try {
        const favorites = await getFavoriteTours();
        return favorites.some(favorite => favorite.tourId === tourId);
    } catch (error) {
        console.error('Помилка при перевірці улюблених:', error);
        return false;
    }
};

// Функція для роботи з сортуванням
export const sortTours = (tours, sortBy, ascending = true) => {
    return [...tours].sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        // Обробка для різних типів даних
        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (aValue === undefined || aValue === null) aValue = 0;
        if (bValue === undefined || bValue === null) bValue = 0;

        if (ascending) {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
    });
};

// Функція для фільтрації турів
export const filterTours = (tours, filters = {}) => {
    let filteredTours = [...tours];

    // Фільтр по країні
    if (filters.country) {
        filteredTours = filteredTours.filter(tour =>
            tour.country === filters.country
        );
    }

    // Фільтр по ціні
    if (filters.minPrice !== undefined) {
        filteredTours = filteredTours.filter(tour =>
            tour.price >= filters.minPrice
        );
    }

    if (filters.maxPrice !== undefined) {
        filteredTours = filteredTours.filter(tour =>
            tour.price <= filters.maxPrice
        );
    }

    // Фільтр по рейтингу
    if (filters.minRating !== undefined) {
        filteredTours = filteredTours.filter(tour =>
            (tour.rating || 0) >= filters.minRating
        );
    }

    // Фільтр по тривалості
    if (filters.duration) {
        filteredTours = filteredTours.filter(tour =>
            tour.duration && tour.duration.includes(filters.duration)
        );
    }

    return filteredTours;
};

// Функція для пошуку турів
export const searchTours = (tours, searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') {
        return tours;
    }

    const term = searchTerm.toLowerCase().trim();

    return tours.filter(tour =>
        (tour.name && tour.name.toLowerCase().includes(term)) ||
        (tour.description && tour.description.toLowerCase().includes(term)) ||
        (tour.location && tour.location.toLowerCase().includes(term)) ||
        (tour.country && tour.country.toLowerCase().includes(term))
    );
};