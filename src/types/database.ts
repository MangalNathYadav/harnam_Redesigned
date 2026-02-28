export interface SitePresets {
    activeTheme: string;
    isFestivalMode: boolean;
    festivalName: string;
    offerBanner: string;
    heroVideo: string;
    activePresetId: string;
    discountPercent?: number;
}

export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number | string;
    image?: string;
    imageBase64?: string;
    rating?: string;
    category?: string;
    stock?: number;
}

export interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

export interface Order {
    id: string;
    userId: string;
    userEmail: string;
    userName: string;
    items: OrderItem[];
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentMethod: 'cod' | 'prepaid';
    paymentStatus: 'pending' | 'completed' | 'failed';
    address: {
        street: string;
        city: string;
        state: string;
        zip: string;
        phone: string;
    };
    createdAt: number;
}

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    phone?: string;
    addresses?: {
        id: string;
        type: string;
        street: string;
        city: string;
        state: string;
        zip: string;
        isDefault: boolean;
    }[];
}

export interface ContactMessage {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt: number;
    status: 'new' | 'read' | 'replied';
}

export interface ActivityLog {
    id: string;
    userId?: string;
    userEmail?: string;
    action: string;
    details: string;
    timestamp: number;
    type: 'auth' | 'order' | 'product' | 'system' | 'interaction';
}
