export enum GameState {
  SELECTING_MOOD,
  DELIVERING_LETTER,
  READING_LETTER,
}

export enum Mood {
  WORKED_HARD = '頑張った日',
  GLOOMY = 'しょんぼりな日',
  HAPPY = 'うれしい日',
  TIRED = 'おつかれな日',
}

export interface SavedLetter {
  id: number;
  mood: Mood | string;
  content: string;
  date: string;
}
