import type { UserProfile } from './types';
import { PlaceHolderImages } from './placeholder-images';

const strangerAvatars = PlaceHolderImages.filter(p => p.id.startsWith('stranger'));

export const allStrangers: UserProfile[] = [
    { 
        id: 'stranger-1',
        username: 'ShadowFigment', 
        avatar: strangerAvatars[0]?.imageUrl || '',
        age: 25,
        gender: 'male',
        location: 'USA',
        online: true,
    },
    { 
        id: 'stranger-2',
        username: 'SilentEcho', 
        avatar: strangerAvatars[1]?.imageUrl || '',
        age: 30,
        gender: 'female',
        location: 'Canada',
        online: true,
    },
    { 
        id: 'stranger-3',
        username: 'GlitchCat', 
        avatar: strangerAvatars[2]?.imageUrl || '',
        age: 22,
        gender: 'other',
        location: 'UK',
        online: false,
    },
    { 
        id: 'stranger-4',
        username: 'PixelJester', 
        avatar: strangerAvatars[3]?.imageUrl || '',
        age: 28,
        gender: 'male',
        location: 'Australia',
        online: true,
    },
    { 
        id: 'stranger-5',
        username: 'DreamWeaver', 
        avatar: strangerAvatars[0]?.imageUrl || '',
        age: 35,
        gender: 'female',
        location: 'USA',
        online: true,
    },
    { 
        id: 'stranger-6',
        username: 'CyberNomad', 
        avatar: strangerAvatars[1]?.imageUrl || '',
        age: 19,
        gender: 'male',
        location: 'Germany',
        online: false,
    },
    { 
        id: 'stranger-7',
        username: 'SynthSage', 
        avatar: strangerAvatars[2]?.imageUrl || '',
        age: 42,
        gender: 'other',
        location: 'Japan',
        online: true,
    },
    { 
        id: 'stranger-8',
        username: 'VoidWanderer', 
        avatar: strangerAvatars[3]?.imageUrl || '',
        age: 29,
        gender: 'female',
        location: 'UK',
        online: true,
    },
];
