import { Injectable, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Network } from '@capacitor/network';

export interface OfflineArticle {
  id: string;
  numero: string;
  titre: string;
  contenu: string;
  tome: string;
  chapitre: string;
  version: string;
  savedAt: Date;
}

export interface OfflineData {
  articles: OfflineArticle[];
  lastSync: Date | null;
}

@Injectable({
  providedIn: 'root'
})
export class OfflineStorageService {
  private readonly STORAGE_KEY = 'cgi242_offline_data';
  private readonly FAVORITES_KEY = 'cgi242_favorites';
  private readonly RECENT_KEY = 'cgi242_recent';

  private readonly _isOnline = signal(true);
  private readonly _offlineArticlesCount = signal(0);

  readonly isOnline = this._isOnline.asReadonly();
  readonly offlineArticlesCount = this._offlineArticlesCount.asReadonly();

  constructor() {
    this.initNetworkListener();
    this.loadOfflineCount();
  }

  private async initNetworkListener(): Promise<void> {
    // Check initial status
    const status = await Network.getStatus();
    this._isOnline.set(status.connected);

    // Listen for changes
    Network.addListener('networkStatusChange', (status) => {
      this._isOnline.set(status.connected);
    });
  }

  private async loadOfflineCount(): Promise<void> {
    const data = await this.getOfflineData();
    this._offlineArticlesCount.set(data.articles.length);
  }

  // Offline data management
  async getOfflineData(): Promise<OfflineData> {
    try {
      const { value } = await Preferences.get({ key: this.STORAGE_KEY });
      if (value) {
        return JSON.parse(value);
      }
    } catch (error) {
      console.warn('Error reading offline data:', error);
    }
    return { articles: [], lastSync: null };
  }

  async saveArticleOffline(article: OfflineArticle): Promise<void> {
    const data = await this.getOfflineData();

    // Check if article already exists
    const existingIndex = data.articles.findIndex(a => a.id === article.id);
    if (existingIndex >= 0) {
      data.articles[existingIndex] = { ...article, savedAt: new Date() };
    } else {
      data.articles.push({ ...article, savedAt: new Date() });
    }

    data.lastSync = new Date();
    await Preferences.set({ key: this.STORAGE_KEY, value: JSON.stringify(data) });
    this._offlineArticlesCount.set(data.articles.length);
  }

  async saveArticlesOffline(articles: OfflineArticle[]): Promise<void> {
    const data = await this.getOfflineData();

    for (const article of articles) {
      const existingIndex = data.articles.findIndex(a => a.id === article.id);
      if (existingIndex >= 0) {
        data.articles[existingIndex] = { ...article, savedAt: new Date() };
      } else {
        data.articles.push({ ...article, savedAt: new Date() });
      }
    }

    data.lastSync = new Date();
    await Preferences.set({ key: this.STORAGE_KEY, value: JSON.stringify(data) });
    this._offlineArticlesCount.set(data.articles.length);
  }

  async removeArticleOffline(articleId: string): Promise<void> {
    const data = await this.getOfflineData();
    data.articles = data.articles.filter(a => a.id !== articleId);
    await Preferences.set({ key: this.STORAGE_KEY, value: JSON.stringify(data) });
    this._offlineArticlesCount.set(data.articles.length);
  }

  async clearOfflineData(): Promise<void> {
    await Preferences.remove({ key: this.STORAGE_KEY });
    this._offlineArticlesCount.set(0);
  }

  async getOfflineArticle(articleId: string): Promise<OfflineArticle | null> {
    const data = await this.getOfflineData();
    return data.articles.find(a => a.id === articleId) || null;
  }

  async searchOfflineArticles(query: string): Promise<OfflineArticle[]> {
    const data = await this.getOfflineData();
    const lowerQuery = query.toLowerCase();
    return data.articles.filter(article =>
      article.numero.toLowerCase().includes(lowerQuery) ||
      article.titre.toLowerCase().includes(lowerQuery) ||
      article.contenu.toLowerCase().includes(lowerQuery)
    );
  }

  // Favorites management
  async getFavorites(): Promise<string[]> {
    try {
      const { value } = await Preferences.get({ key: this.FAVORITES_KEY });
      return value ? JSON.parse(value) : [];
    } catch {
      return [];
    }
  }

  async addFavorite(articleId: string): Promise<void> {
    const favorites = await this.getFavorites();
    if (!favorites.includes(articleId)) {
      favorites.push(articleId);
      await Preferences.set({ key: this.FAVORITES_KEY, value: JSON.stringify(favorites) });
    }
  }

  async removeFavorite(articleId: string): Promise<void> {
    const favorites = await this.getFavorites();
    const filtered = favorites.filter(id => id !== articleId);
    await Preferences.set({ key: this.FAVORITES_KEY, value: JSON.stringify(filtered) });
  }

  async isFavorite(articleId: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.includes(articleId);
  }

  // Recent articles
  async getRecentArticles(): Promise<string[]> {
    try {
      const { value } = await Preferences.get({ key: this.RECENT_KEY });
      return value ? JSON.parse(value) : [];
    } catch {
      return [];
    }
  }

  async addRecentArticle(articleId: string): Promise<void> {
    let recent = await this.getRecentArticles();
    // Remove if exists and add to front
    recent = recent.filter(id => id !== articleId);
    recent.unshift(articleId);
    // Keep only last 20
    recent = recent.slice(0, 20);
    await Preferences.set({ key: this.RECENT_KEY, value: JSON.stringify(recent) });
  }

  // Storage info
  async getStorageInfo(): Promise<{ used: number; articlesCount: number; lastSync: Date | null }> {
    const data = await this.getOfflineData();
    const dataString = JSON.stringify(data);
    return {
      used: new Blob([dataString]).size,
      articlesCount: data.articles.length,
      lastSync: data.lastSync,
    };
  }
}
