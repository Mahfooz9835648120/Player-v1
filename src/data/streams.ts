export interface Stream {
  id: string;
  title: string;
  streamer: string;
  avatar: string;
  thumbnail: string;
  game: string;
  viewers: number;
  isLive: boolean;
  tags: string[];
  category: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  viewers: number;
}

export const streams: Stream[] = [
  {
    id: '1',
    title: 'Ranked Grind - Road to Diamond 💎',
    streamer: 'NightfallGG',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=NightfallGG&backgroundColor=6b3fa0',
    thumbnail: 'https://picsum.photos/seed/stream1/400/225',
    game: 'League of Legends',
    viewers: 42831,
    isLive: true,
    tags: ['Ranked', 'Competitive', 'English'],
    category: 'gaming',
  },
  {
    id: '2',
    title: '🎵 Chill Lofi Beats - Studying & Coding',
    streamer: 'LofiWave',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=LofiWave&backgroundColor=1a6b3a',
    thumbnail: 'https://picsum.photos/seed/stream2/400/225',
    game: 'Music',
    viewers: 28450,
    isLive: true,
    tags: ['Music', 'Lofi', 'Chill'],
    category: 'music',
  },
  {
    id: '3',
    title: 'WORLD RECORD ATTEMPT - Speedrun Any%',
    streamer: 'SpeedDemonX',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=SpeedDemonX&backgroundColor=8b1a1a',
    thumbnail: 'https://picsum.photos/seed/stream3/400/225',
    game: 'Super Mario Odyssey',
    viewers: 19200,
    isLive: true,
    tags: ['Speedrun', 'World Record', 'Nintendo'],
    category: 'gaming',
  },
  {
    id: '4',
    title: 'IRL Travel: Exploring Tokyo 🇯🇵',
    streamer: 'WanderlustTV',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=WanderlustTV&backgroundColor=1a4b8b',
    thumbnail: 'https://picsum.photos/seed/stream4/400/225',
    game: 'IRL',
    viewers: 15600,
    isLive: true,
    tags: ['Travel', 'IRL', 'Japan'],
    category: 'irl',
  },
  {
    id: '5',
    title: 'Pro Coaching Session | Improve Your Aim',
    streamer: 'AimLabPro',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=AimLabPro&backgroundColor=4b1a8b',
    thumbnail: 'https://picsum.photos/seed/stream5/400/225',
    game: 'Valorant',
    viewers: 11340,
    isLive: true,
    tags: ['Educational', 'FPS', 'Coaching'],
    category: 'gaming',
  },
  {
    id: '6',
    title: 'Just Chatting - Q&A with Subscribers',
    streamer: 'StellaVox',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=StellaVox&backgroundColor=8b4b1a',
    thumbnail: 'https://picsum.photos/seed/stream6/400/225',
    game: 'Just Chatting',
    viewers: 9870,
    isLive: true,
    tags: ['Talk Show', 'Q&A', 'Community'],
    category: 'talk',
  },
  {
    id: '7',
    title: '🔴 Minecraft Survival - Day 500!',
    streamer: 'CubeCrafter',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=CubeCrafter&backgroundColor=3a8b1a',
    thumbnail: 'https://picsum.photos/seed/stream7/400/225',
    game: 'Minecraft',
    viewers: 8560,
    isLive: true,
    tags: ['Survival', 'Minecraft', 'Milestone'],
    category: 'gaming',
  },
  {
    id: '8',
    title: 'Digital Art Session - Character Design',
    streamer: 'PixelMuse',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=PixelMuse&backgroundColor=8b1a6b',
    thumbnail: 'https://picsum.photos/seed/stream8/400/225',
    game: 'Art',
    viewers: 7230,
    isLive: true,
    tags: ['Art', 'Creative', 'Drawing'],
    category: 'creative',
  },
  {
    id: '9',
    title: 'Chess Master vs Community',
    streamer: 'GrandmasterK',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=GrandmasterK&backgroundColor=1a1a8b',
    thumbnail: 'https://picsum.photos/seed/stream9/400/225',
    game: 'Chess',
    viewers: 6100,
    isLive: true,
    tags: ['Chess', 'Strategy', 'Educational'],
    category: 'gaming',
  },
  {
    id: '10',
    title: 'Cooking Stream - Making Ramen from Scratch',
    streamer: 'ChefNoodle',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ChefNoodle&backgroundColor=8b6b1a',
    thumbnail: 'https://picsum.photos/seed/stream10/400/225',
    game: 'Food & Drink',
    viewers: 4890,
    isLive: true,
    tags: ['Cooking', 'IRL', 'Food'],
    category: 'irl',
  },
  {
    id: '11',
    title: 'Horror Games - Scary Playthrough 😱',
    streamer: 'ScreamFactory',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ScreamFactory&backgroundColor=5a1a1a',
    thumbnail: 'https://picsum.photos/seed/stream11/400/225',
    game: 'Resident Evil 4',
    viewers: 3740,
    isLive: true,
    tags: ['Horror', 'Gaming', 'Scary'],
    category: 'gaming',
  },
  {
    id: '12',
    title: 'DJ Set 🎧 Deep House Vibes',
    streamer: 'BassDropKing',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=BassDropKing&backgroundColor=1a5a8b',
    thumbnail: 'https://picsum.photos/seed/stream12/400/225',
    game: 'Music & Performing Arts',
    viewers: 2980,
    isLive: true,
    tags: ['DJ', 'Electronic', 'House Music'],
    category: 'music',
  },
];

export const categories: Category[] = [
  { id: 'gaming', name: 'Gaming', image: 'https://picsum.photos/seed/cat-gaming/200/270', viewers: 1240000 },
  { id: 'music', name: 'Music', image: 'https://picsum.photos/seed/cat-music/200/270', viewers: 380000 },
  { id: 'irl', name: 'IRL', image: 'https://picsum.photos/seed/cat-irl/200/270', viewers: 290000 },
  { id: 'talk', name: 'Just Chatting', image: 'https://picsum.photos/seed/cat-chat/200/270', viewers: 520000 },
  { id: 'creative', name: 'Art & Creative', image: 'https://picsum.photos/seed/cat-art/200/270', viewers: 175000 },
  { id: 'sports', name: 'Sports', image: 'https://picsum.photos/seed/cat-sports/200/270', viewers: 210000 },
];

export function formatViewers(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}
