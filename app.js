/**
 * app.js - Logique principale du Journal Mémoire
 * Contrôle des vues, reconnaissance vocale, persistance, calendrier et statistiques.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // ==========================================
  // 1. Initialisation de l'état
  // ==========================================
  let allMemories = [];
  let filteredMemories = [];
  let activeView = 'viewTimeline';
  let activeMoodFilter = 'all';
  let searchQuery = '';

  // État pour la vue journalière (Chaque jour est seul)
  let selectedDayDate = new Date().toISOString().split('T')[0];
  let journalMode = 'single'; // 'single' ou 'search' ou 'all'

  // État de l'éditeur en cours
  let currentEditingMemory = null;
  let editorRecordedAudio = null; // { audioBlob, audioDataUrl }
  let editorPhotos = []; // array of data URLs
  let editorLocation = null; // { latitude, longitude, address, mapsUrl }
  let editorAudioPlayer = null;
  let activeCardAudioPlayer = null;

  // Calendrier
  let calendarCursor = new Date();
  let selectedCalendarDate = new Date().toISOString().split('T')[0];

  // Gestionnaire de parole
  const speechManager = new SpeechManager();

  // Mot de passe / Protection intimité
  let userPassword = null;

  // ==========================================
  // 2. Éléments DOM
  // ==========================================
  const views = {
    viewTimeline: document.getElementById('viewTimeline'),
    viewCalendar: document.getElementById('viewCalendar'),
    viewStats: document.getElementById('viewStats'),
    viewSettings: document.getElementById('viewSettings')
  };

  const navItems = document.querySelectorAll('.nav-item');
  const memoriesTimeline = document.getElementById('memoriesTimeline');
  const searchInput = document.getElementById('searchInput');
  const moodFilterButtons = document.querySelectorAll('.mood-pill[data-mood]');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const quickVoiceHeaderBtn = document.getElementById('quickVoiceHeaderBtn');
  const lockAppBtn = document.getElementById('lockAppBtn');

  // Navigation jour par jour (Chaque jour est seul)
  const prevDayBtn = document.getElementById('prevDayBtn');
  const nextDayBtn = document.getElementById('nextDayBtn');
  const dayPickerTrigger = document.getElementById('dayPickerTrigger');
  const dayWeekdayLabel = document.getElementById('dayWeekdayLabel');
  const dayDateLabel = document.getElementById('dayDateLabel');
  const dayDirectDatePicker = document.getElementById('dayDirectDatePicker');
  const jumpTodayBtn = document.getElementById('jumpTodayBtn');
  const chooseDatePillBtn = document.getElementById('chooseDatePillBtn');
  const toggleTimelineModeBtn = document.getElementById('toggleTimelineModeBtn');
  const singleDayContainer = document.getElementById('singleDayContainer');
  const searchTimelineContainer = document.getElementById('searchTimelineContainer');
  const searchCountBadge = document.getElementById('searchCountBadge');

  // FAB
  const fabVoiceBtn = document.getElementById('fabVoiceBtn');
  const fabAddBtn = document.getElementById('fabAddBtn');

  // Modals
  const editorModal = document.getElementById('editorModal');
  const closeEditorBtn = document.getElementById('closeEditorBtn');
  const cancelEditorBtn = document.getElementById('cancelEditorBtn');
  const saveEntryBtn = document.getElementById('saveEntryBtn');
  const editorModalTitle = document.getElementById('editorModalTitle');

  // Champs de l'éditeur
  const entryDateInput = document.getElementById('entryDateInput');
  const entryTimeInput = document.getElementById('entryTimeInput');
  const entryTitleInput = document.getElementById('entryTitleInput');
  const entryContentInput = document.getElementById('entryContentInput');
  const wordCountLabel = document.getElementById('wordCountLabel');
  const editorMoodOptions = document.querySelectorAll('#editorMoodSelector .mood-option');
  const voiceLangSelect = document.getElementById('voiceLangSelect');
  const micToggleBtn = document.getElementById('micToggleBtn');
  const micBtnIcon = document.getElementById('micBtnIcon');
  const micBtnLabel = document.getElementById('micBtnLabel');
  const voiceStatusText = document.getElementById('voiceStatusText');
  const liveInterimBox = document.getElementById('liveInterimBox');
  const soundWaveBars = document.getElementById('soundWaveBars');
  const recordAudioCheckbox = document.getElementById('recordAudioCheckbox');
  const editorAudioPreviewBox = document.getElementById('editorAudioPreviewBox');
  const editorAudioPlayBtn = document.getElementById('editorAudioPlayBtn');
  const editorAudioProgressBar = document.getElementById('editorAudioProgressBar');
  const editorAudioCurrentTime = document.getElementById('editorAudioCurrentTime');
  const editorAudioTotalDuration = document.getElementById('editorAudioTotalDuration');
  const deleteAudioBtn = document.getElementById('deleteAudioBtn');

  // Photos
  const photoInput = document.getElementById('photoInput');
  const photosPreviewList = document.getElementById('photosPreviewList');

  // Localisation DOM
  const btnGetLocation = document.getElementById('btnGetLocation');
  const locationBtnText = document.getElementById('locationBtnText');
  const locationBadge = document.getElementById('locationBadge');
  const locationBadgeText = document.getElementById('locationBadgeText');
  const removeLocationBtn = document.getElementById('removeLocationBtn');
  const locationStatusMsg = document.getElementById('locationStatusMsg');
  const detailLocationBox = document.getElementById('detailLocationBox');
  const detailLocationLink = document.getElementById('detailLocationLink');
  const detailLocationText = document.getElementById('detailLocationText');

  // Tags
  const tagChoices = document.querySelectorAll('.tag-choice');

  // Modal Détail
  const detailModal = document.getElementById('detailModal');
  const closeDetailBtn = document.getElementById('closeDetailBtn');
  const detailMoodBadge = document.getElementById('detailMoodBadge');
  const detailDateText = document.getElementById('detailDateText');
  const detailTitleText = document.getElementById('detailTitleText');
  const detailContentText = document.getElementById('detailContentText');
  const detailTagsList = document.getElementById('detailTagsList');
  const detailPhotosGallery = document.getElementById('detailPhotosGallery');
  const detailAudioBox = document.getElementById('detailAudioBox');
  const detailAudioPlayBtn = document.getElementById('detailAudioPlayBtn');
  const detailAudioProgressBar = document.getElementById('detailAudioProgressBar');
  const detailAudioCurrentTime = document.getElementById('detailAudioCurrentTime');
  const detailAudioTotalDuration = document.getElementById('detailAudioTotalDuration');
  const detailFavBtn = document.getElementById('detailFavBtn');
  const detailEditBtn = document.getElementById('detailEditBtn');
  const detailDeleteBtn = document.getElementById('detailDeleteBtn');
  let currentDetailMemory = null;
  let detailAudioPlayer = null;

  // Calendrier DOM
  const prevMonthBtn = document.getElementById('prevMonthBtn');
  const nextMonthBtn = document.getElementById('nextMonthBtn');
  const currentMonthYearLabel = document.getElementById('currentMonthYearLabel');
  const calendarGrid = document.getElementById('calendarGrid');
  const calendarDayMemories = document.getElementById('calendarDayMemories');
  const selectedDayTitle = document.getElementById('selectedDayTitle');

  // Statistiques DOM
  const statStreak = document.getElementById('statStreak');
  const statTotalNotes = document.getElementById('statTotalNotes');
  const statTotalWords = document.getElementById('statTotalWords');
  const statTopMood = document.getElementById('statTopMood');
  const throwbackContainer = document.getElementById('throwbackContainer');
  const moodStatsList = document.getElementById('moodStatsList');

  // Paramètres DOM
  const settingThemeBtn = document.getElementById('settingThemeBtn');
  const currentThemeDesc = document.getElementById('currentThemeDesc');
  const settingVoiceLangBtn = document.getElementById('settingVoiceLangBtn');
  const currentLangDesc = document.getElementById('currentLangDesc');
  const settingPinBtn = document.getElementById('settingPinBtn');
  const currentPinDesc = document.getElementById('currentPinDesc');
  const exportBackupBtn = document.getElementById('exportBackupBtn');
  const importBackupBtn = document.getElementById('importBackupBtn');
  const backupFileInput = document.getElementById('backupFileInput');
  const installPwaBtn = document.getElementById('installPwaBtn');
  const clearAllDataBtn = document.getElementById('clearAllDataBtn');

  // Mot de passe / Sécurité DOM
  const pinScreen = document.getElementById('pinScreen');
  const appPasswordInput = document.getElementById('appPasswordInput');
  const togglePassEyeBtn = document.getElementById('togglePassEyeBtn');
  const unlockAppBtn = document.getElementById('unlockAppBtn');
  const passwordErrorMsg = document.getElementById('passwordErrorMsg');
  const pinKeys = document.querySelectorAll('.pin-key[data-num]');
  const pinDeleteBtn = document.getElementById('pinDeleteBtn');
  const pinClearBtn = document.getElementById('pinClearBtn');

  // ==========================================
  // 3. Initialisation et Chargement
  // ==========================================
  async function initApp() {
    registerServiceWorker();
    await window.JournalDB.openDB();

    // Apparence / Thème
    const savedTheme = await window.JournalDB.getSetting('theme', 'dark');
    applyTheme(savedTheme);

    // Langue de dictée
    const savedLang = await window.JournalDB.getSetting('voiceLang', 'ar-DZ');
    speechManager.lang = savedLang;
    if (voiceLangSelect) voiceLangSelect.value = savedLang;
    const langLabels = {
      'ar-DZ': '🇩🇿 الدارجة الجزائرية (ar-DZ)',
      'fr-FR': '🇫🇷 Français (France)',
      'ar-SA': '🇸🇦 العربية الفصحى (ar-SA)',
      'en-US': '🇬🇧 English (US)'
    };
    currentLangDesc.textContent = langLabels[savedLang] || savedLang;

    // Protection Intimité par Mot de passe
    userPassword = await window.JournalDB.getSetting('appPassword', null) || await window.JournalDB.getSetting('pinCode', null);
    if (userPassword) {
      currentPinDesc.textContent = 'Activé (Protégé)';
      lockApp();
    } else {
      currentPinDesc.textContent = 'Désactivé';
    }

    // Charger les souvenirs
    await loadMemories();

    // Initialiser la date du jour
    goToDate(getTodayDateString());

    // Initialiser l'éditeur
    resetEditorFields();

    // Écouteurs globaux
    setupEventListeners();
  }


  // ==========================================
  // 4. Gestion du Thème (Sombre / Clair)
  // ==========================================
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggleBtn.textContent = theme === 'light' ? '☀️' : '🌙';
    currentThemeDesc.textContent = theme === 'light' ? 'Mode Clair' : 'Mode Sombre';
  }

  async function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    await window.JournalDB.setSetting('theme', next);
  }

  // ==========================================
  // 5. Chargement et Filtres des Souvenirs
  // ==========================================
  // ==========================================
  // 5. Navigation Jour par Jour & Filtres
  // ==========================================
  async function loadMemories() {
    allMemories = await window.JournalDB.getAllMemories();
    applyFilters();
    renderCalendar();
    renderStats();
  }

  function applyFilters() {
    const q = searchQuery.trim().toLowerCase();
    filteredMemories = allMemories.filter(m => {
      // Filtre d'humeur / favori
      if (activeMoodFilter === 'favorite' && !m.favorite) return false;
      if (activeMoodFilter !== 'all' && activeMoodFilter !== 'favorite' && m.mood !== activeMoodFilter) {
        return false;
      }
      // Filtre de recherche
      if (q) {
        const titleMatch = (m.title || '').toLowerCase().includes(q);
        const contentMatch = (m.content || '').toLowerCase().includes(q);
        const tagsMatch = (m.tags || []).some(t => t.toLowerCase().includes(q));
        const dateMatch = (m.date || '').includes(q);
        const locMatch = m.location && (m.location.address || '').toLowerCase().includes(q);
        return titleMatch || contentMatch || tagsMatch || dateMatch || locMatch;
      }
      return true;
    });

    renderDayView();
  }

  function goToDate(dateStr) {
    selectedDayDate = dateStr;
    journalMode = 'single';
    if (toggleTimelineModeBtn) {
      toggleTimelineModeBtn.textContent = '📜 Afficher tous les jours';
      toggleTimelineModeBtn.classList.remove('active');
    }
    updateDayNavigationHeader();
    renderDayView();
  }

  function updateDayNavigationHeader() {
    const todayStr = getTodayDateString();
    if (dayDirectDatePicker) dayDirectDatePicker.value = selectedDayDate;

    try {
      const parts = selectedDayDate.split('-');
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      const weekday = d.toLocaleDateString('fr-FR', { weekday: 'long' });
      const fullDate = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

      if (selectedDayDate === todayStr) {
        dayWeekdayLabel.textContent = `Aujourd'hui (${weekday})`;
      } else {
        dayWeekdayLabel.textContent = weekday;
      }
      dayDateLabel.textContent = fullDate;
    } catch (e) {
      dayDateLabel.textContent = selectedDayDate;
    }

    if (jumpTodayBtn) {
      jumpTodayBtn.classList.toggle('active', selectedDayDate === todayStr);
    }
  }

  function changeDayOffset(deltaDays) {
    const parts = selectedDayDate.split('-');
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() + deltaDays);
    const newStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    goToDate(newStr);
  }

  // ==========================================
  // 6. Rendu de la Fiche du Jour (Chaque jour est seul)
  // ==========================================
  function renderDayView() {
    const isSearchActive = (searchQuery.trim().length > 0) || (activeMoodFilter !== 'all');

    if (journalMode === 'all' || isSearchActive) {
      singleDayContainer.style.display = 'none';
      searchTimelineContainer.style.display = 'block';
      renderSearchTimeline();
      return;
    }

    // Mode Jour Unique
    singleDayContainer.style.display = 'flex';
    searchTimelineContainer.style.display = 'none';
    singleDayContainer.innerHTML = '';

    const dayMemories = allMemories.filter(m => m.date === selectedDayDate);

    if (dayMemories.length === 0) {
      const emptyCard = document.createElement('div');
      emptyCard.className = 'single-day-card';
      emptyCard.innerHTML = `
        <div style="text-align: center; padding: 24px 10px;">
          <div style="font-size: 3.2rem; margin-bottom: 12px; opacity: 0.85;">📔</div>
          <h3 style="font-size: 1.15rem; margin-bottom: 6px;">Aucun souvenir noté pour ce jour</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 20px;">
            ${formatDateFrench(selectedDayDate)}<br>Capturez vos moments par la voix ou le clavier.
          </p>
          <div style="display: flex; flex-direction: column; gap: 10px; max-width: 280px; margin: 0 auto;">
            <button class="btn btn-primary" id="dayVoiceAddBtn">
              🎙️ Dicter cette journée à la voix
            </button>
            <button class="btn btn-secondary" id="dayTextAddBtn">
              ✍️ Écrire au clavier
            </button>
          </div>
        </div>
      `;
      emptyCard.querySelector('#dayVoiceAddBtn').addEventListener('click', () => {
        openEditor({ startVoice: true, prefillDate: selectedDayDate });
      });
      emptyCard.querySelector('#dayTextAddBtn').addEventListener('click', () => {
        openEditor({ startVoice: false, prefillDate: selectedDayDate });
      });
      singleDayContainer.appendChild(emptyCard);
      return;
    }

    // Des souvenirs existent pour ce jour
    dayMemories.forEach(mem => {
      const card = createMemoryCardElement(mem);
      singleDayContainer.appendChild(card);
    });

    // Bouton pour ajouter un autre souvenir pour cette journée
    const addMoreBtn = document.createElement('button');
    addMoreBtn.className = 'btn btn-secondary';
    addMoreBtn.style.marginTop = '4px';
    addMoreBtn.innerHTML = `➕ Ajouter un autre événement à ce jour`;
    addMoreBtn.addEventListener('click', () => {
      openEditor({ startVoice: false, prefillDate: selectedDayDate });
    });
    singleDayContainer.appendChild(addMoreBtn);
  }

  function renderSearchTimeline() {
    memoriesTimeline.innerHTML = '';
    const count = filteredMemories.length;
    searchCountBadge.textContent = `${count} souvenir${count > 1 ? 's' : ''} trouvé${count > 1 ? 's' : ''}`;

    if (count === 0) {
      memoriesTimeline.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>Aucun souvenir trouvé</h3>
          <p>Aucun événement ne correspond à vos critères de recherche.</p>
          <button class="btn btn-secondary" id="resetSearchBtn" style="max-width: 200px; margin: 12px auto 0 auto;">
            Revenir à la vue par jour
          </button>
        </div>
      `;
      const resetBtn = memoriesTimeline.querySelector('#resetSearchBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          searchQuery = '';
          searchInput.value = '';
          activeMoodFilter = 'all';
          moodFilterButtons.forEach(b => b.classList.toggle('active', b.dataset.mood === 'all'));
          journalMode = 'single';
          renderDayView();
        });
      }
      return;
    }

    filteredMemories.forEach(memory => {
      const card = createMemoryCardElement(memory);
      memoriesTimeline.appendChild(card);
    });
  }

  function createMemoryCardElement(memory) {
    const card = document.createElement('div');
    card.className = 'memory-card';

    // Formatage de la date en français
    const dateFormatted = formatDateFrench(memory.date);

    // Vignettes photos
    let photosHtml = '';
    if (memory.photos && memory.photos.length > 0) {
      photosHtml = `
        <div class="card-images-grid">
          ${memory.photos.slice(0, 3).map(p => `<img src="${p}" class="card-thumb" alt="Souvenir photo" loading="lazy">`).join('')}
          ${memory.photos.length > 3 ? `<div style="display:flex;align-items:center;padding:0 8px;font-size:0.8rem;color:var(--text-sub);">+${memory.photos.length - 3}</div>` : ''}
        </div>
      `;
    }

    // Badge audio si note vocale
    let audioHtml = '';
    if (memory.audio) {
      audioHtml = `
        <div class="audio-preview-bar" data-audio-card="${memory.id}">
          <button type="button" class="audio-play-btn card-audio-play" data-id="${memory.id}">▶</button>
          <div class="audio-track">
            <div class="audio-progress">
              <div class="audio-progress-bar card-progress-${memory.id}"></div>
            </div>
            <div class="audio-time-label">
              <span class="card-current-${memory.id}">0:00</span>
              <span>🎙️ Note vocale</span>
            </div>
          </div>
        </div>
      `;
    }

    // Tags
    let tagsHtml = '';
    if (memory.tags && memory.tags.length > 0) {
      tagsHtml = `
        <div class="card-tags">
          ${memory.tags.map(t => `<span class="tag-badge">#${t}</span>`).join('')}
        </div>
      `;
    }

    // Localisation GPS / Google Maps
    let locationHtml = '';
    if (memory.location && (memory.location.latitude || memory.location.address)) {
      const mapsUrl = memory.location.mapsUrl || `https://www.google.com/maps?q=${memory.location.latitude},${memory.location.longitude}`;
      const locLabel = escapeHtml(memory.location.address || `${memory.location.latitude.toFixed(4)}, ${memory.location.longitude.toFixed(4)}`);
      locationHtml = `
        <div class="card-location">
          <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="location-chip" title="Ouvrir dans Google Maps">
            <span>📍</span>
            <span>${locLabel}</span>
            <span style="font-size: 0.7rem; opacity: 0.7;">↗</span>
          </a>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="card-header">
        <div class="card-date-info">
          <div class="mood-badge">${memory.mood || '😊'}</div>
          <div>
            <div class="date-text">${dateFormatted}</div>
            <div class="time-text">${memory.time || ''}</div>
          </div>
        </div>
        <div class="card-actions">
          <button class="favorite-star ${memory.favorite ? 'active' : ''}" data-fav-id="${memory.id}">
            ${memory.favorite ? '★' : '☆'}
          </button>
        </div>
      </div>

      ${memory.title ? `<div class="card-title" dir="auto">${escapeHtml(memory.title)}</div>` : ''}
      <div class="card-preview" dir="auto">${escapeHtml(memory.content || '(Souvenir sans texte)')}</div>

      ${audioHtml}
      ${photosHtml}
      ${locationHtml}
      ${tagsHtml}
    `;

    // Clic pour ouvrir le détail
    card.addEventListener('click', (e) => {
      // Ignorer si on clique sur favori, localisation ou le lecteur audio
      if (e.target.closest('.favorite-star') || e.target.closest('.card-audio-play') || e.target.closest('.location-chip')) return;
      openDetailModal(memory);
    });

    // Écouteur Favori
    const favBtn = card.querySelector('.favorite-star');
    favBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await window.JournalDB.toggleFavorite(memory.id);
      await loadMemories();
    });

    // Écouteur Lecteur Audio de la carte
    const cardAudioBtn = card.querySelector('.card-audio-play');
    if (cardAudioBtn) {
      cardAudioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleCardAudioPlay(memory, card);
      });
    }

    return card;
  }

  function handleCardAudioPlay(memory, card) {
    const playBtn = card.querySelector(`.card-audio-play[data-id="${memory.id}"]`);
    const progressBar = card.querySelector(`.card-progress-${memory.id}`);
    const currentLabel = card.querySelector(`.card-current-${memory.id}`);

    if (activeCardAudioPlayer && activeCardAudioPlayer.memoryId === memory.id) {
      if (!activeCardAudioPlayer.audio.paused) {
        activeCardAudioPlayer.audio.pause();
        playBtn.textContent = '▶';
        return;
      } else {
        activeCardAudioPlayer.audio.play();
        playBtn.textContent = '⏸';
        return;
      }
    }

    // Arrêter tout lecteur en cours
    stopAllAudioPlayers();

    const audio = new Audio(memory.audio);
    activeCardAudioPlayer = { audio, memoryId: memory.id, playBtn, progressBar, currentLabel };
    playBtn.textContent = '⏸';

    audio.ontimeupdate = () => {
      if (audio.duration) {
        const pct = (audio.currentTime / audio.duration) * 100;
        if (progressBar) progressBar.style.width = pct + '%';
        if (currentLabel) currentLabel.textContent = formatDuration(audio.currentTime);
      }
    };

    audio.onended = () => {
      playBtn.textContent = '▶';
      if (progressBar) progressBar.style.width = '0%';
      if (currentLabel) currentLabel.textContent = '0:00';
      activeCardAudioPlayer = null;
    };

    audio.play().catch(e => console.warn('Erreur lecture audio:', e));
  }

  function stopAllAudioPlayers() {
    if (activeCardAudioPlayer) {
      activeCardAudioPlayer.audio.pause();
      if (activeCardAudioPlayer.playBtn) activeCardAudioPlayer.playBtn.textContent = '▶';
      activeCardAudioPlayer = null;
    }
    if (editorAudioPlayer) {
      editorAudioPlayer.pause();
      editorAudioPlayBtn.textContent = '▶';
    }
    if (detailAudioPlayer) {
      detailAudioPlayer.pause();
      detailAudioPlayBtn.textContent = '▶';
    }
  }

  // ==========================================
  // 7. Modal Éditeur (Saisie Vocale & Clavier)
  // ==========================================
  function openEditor({ memory = null, startVoice = false, prefillDate = null } = {}) {
    stopAllAudioPlayers();
    currentEditingMemory = memory;
    editorRecordedAudio = null;
    editorPhotos = [];

    if (memory) {
      editorModalTitle.textContent = 'Modifier le souvenir';
      entryDateInput.value = memory.date || getTodayDateString();
      entryTimeInput.value = memory.time || getCurrentTimeString();
      entryTitleInput.value = memory.title || '';
      entryContentInput.value = memory.content || '';
      setSelectedMood(memory.mood || '😊');

      // Photos existantes
      editorPhotos = memory.photos ? [...memory.photos] : [];
      renderEditorPhotosPreview();

      // Audio existant
      if (memory.audio) {
        editorRecordedAudio = { audioDataUrl: memory.audio };
        showEditorAudioPreview(memory.audio);
      } else {
        editorAudioPreviewBox.style.display = 'none';
      }

      // Tags existants
      tagChoices.forEach(btn => {
        btn.classList.toggle('active', (memory.tags || []).includes(btn.dataset.tag));
      });

      // Localisation existante
      editorLocation = (memory.location && (memory.location.latitude || memory.location.address)) ? { ...memory.location } : null;
      renderEditorLocation();
    } else {
      editorModalTitle.textContent = 'Nouveau Souvenir';
      resetEditorFields();
      if (prefillDate) {
        entryDateInput.value = prefillDate;
      }
    }

    if (voiceLangSelect) {
      voiceLangSelect.value = speechManager.lang;
    }

    updateWordCount();
    editorModal.classList.add('active');

    if (startVoice) {
      startVoiceDictation();
    }
  }

  function closeEditor() {
    stopVoiceDictation();
    stopAllAudioPlayers();
    editorModal.classList.remove('active');
    currentEditingMemory = null;
  }

  function resetEditorFields() {
    entryDateInput.value = getTodayDateString();
    entryTimeInput.value = getCurrentTimeString();
    entryTitleInput.value = '';
    entryContentInput.value = '';
    setSelectedMood('😊');
    editorPhotos = [];
    renderEditorPhotosPreview();
    editorRecordedAudio = null;
    editorAudioPreviewBox.style.display = 'none';
    editorLocation = null;
    renderEditorLocation();
    tagChoices.forEach(btn => btn.classList.remove('active'));
    liveInterimBox.textContent = '';
    liveInterimBox.classList.remove('active');
    resetVoiceUI();
  }

  function setSelectedMood(mood) {
    editorMoodOptions.forEach(opt => {
      opt.classList.toggle('selected', opt.dataset.mood === mood);
    });
  }

  function getSelectedMood() {
    const sel = document.querySelector('#editorMoodSelector .mood-option.selected');
    return sel ? sel.dataset.mood : '😊';
  }

  function updateWordCount() {
    const text = entryContentInput.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    wordCountLabel.textContent = `${words} mot${words > 1 ? 's' : ''}`;
  }

  // ==========================================
  // Gestion de la Localisation GPS & Google Maps
  // ==========================================
  function renderEditorLocation() {
    if (!locationBadge || !btnGetLocation) return;
    if (editorLocation && (editorLocation.latitude || editorLocation.address)) {
      const label = editorLocation.address || `${editorLocation.latitude.toFixed(4)}, ${editorLocation.longitude.toFixed(4)}`;
      locationBadgeText.textContent = `📍 ${label}`;
      locationBadge.style.display = 'inline-flex';
      btnGetLocation.style.display = 'none';
      if (locationStatusMsg) locationStatusMsg.textContent = '';
    } else {
      locationBadge.style.display = 'none';
      btnGetLocation.style.display = 'inline-flex';
      locationBtnText.textContent = 'Ajouter ma position';
      if (locationStatusMsg) locationStatusMsg.textContent = '';
    }
  }

  async function getCurrentLocation() {
    if (!navigator.geolocation) {
      if (locationStatusMsg) locationStatusMsg.textContent = "La géolocalisation n'est pas supportée par ce navigateur.";
      return;
    }

    locationBtnText.textContent = 'Recherche GPS...';
    if (locationStatusMsg) locationStatusMsg.textContent = 'Acquisition de votre position GPS en cours...';

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

        // Tentative d'obtention de la ville/pays (OpenStreetMap reverse geocoding sans clé)
        try {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 3500);
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, { signal: ctrl.signal });
          clearTimeout(timer);
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const place = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
            const country = addr.country || '';
            if (place && country) {
              address = `${place}, ${country}`;
            } else if (data.display_name) {
              address = data.display_name.split(',').slice(0, 2).join(',');
            }
          }
        } catch (e) {
          // Si hors ligne, les coordonnées suffisent
        }

        editorLocation = {
          latitude: lat,
          longitude: lng,
          address: address,
          mapsUrl: `https://www.google.com/maps?q=${lat},${lng}`
        };

        renderEditorLocation();
        if (locationStatusMsg) {
          locationStatusMsg.textContent = 'Position GPS enregistrée !';
          setTimeout(() => { if (locationStatusMsg) locationStatusMsg.textContent = ''; }, 3000);
        }
      },
      (err) => {
        locationBtnText.textContent = 'Ajouter ma position';
        let msg = "Impossible d'obtenir la position GPS.";
        if (err.code === 1) msg = "Accès au GPS refusé. Veuillez l'autoriser dans votre navigateur.";
        else if (err.code === 2) msg = "Position GPS indisponible. Activez la localisation de votre smartphone.";
        else if (err.code === 3) msg = "Délai d'attente GPS dépassé.";
        if (locationStatusMsg) locationStatusMsg.textContent = msg;
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  // ==========================================
  // 8. Logique Vocale (Speech Manager)
  // ==========================================
  async function startVoiceDictation() {
    const withAudio = recordAudioCheckbox.checked;
    micToggleBtn.classList.add('recording');
    micBtnIcon.textContent = '⏹️';
    micBtnLabel.textContent = 'Arrêter';
    voiceStatusText.innerHTML = '<span class="pulse-dot"></span> Écoute en cours... Parlez naturellement';
    soundWaveBars.style.display = 'flex';
    liveInterimBox.classList.add('active');

    speechManager.onInterimResult = (interim) => {
      liveInterimBox.textContent = interim;
    };

    speechManager.onFinalResult = (finalText) => {
      const current = entryContentInput.value;
      const separator = current && !current.endsWith('\n') && !current.endsWith(' ') ? ' ' : '';
      entryContentInput.value = current + separator + finalText;
      updateWordCount();
      liveInterimBox.textContent = '';
      // Scroll to bottom of textarea
      entryContentInput.scrollTop = entryContentInput.scrollHeight;
    };

    speechManager.onAudioVolume = (volRatio) => {
      const bars = soundWaveBars.querySelectorAll('.sound-bar');
      bars.forEach((bar, idx) => {
        const factor = 1 + Math.sin(idx + Date.now() / 200) * 0.5;
        const height = Math.max(4, Math.round(volRatio * 22 * factor));
        bar.style.height = height + 'px';
      });
    };

    speechManager.onStatusChange = (status, msg) => {
      if (status === 'error') {
        voiceStatusText.innerHTML = `<span style="color:var(--danger)">⚠️ ${msg}</span>`;
        resetVoiceUI();
      }
    };

    await speechManager.start({ withAudioRecord: withAudio, lang: speechManager.lang });
  }

  async function stopVoiceDictation() {
    if (!speechManager.isListening && (!speechManager.mediaRecorder || speechManager.mediaRecorder.state === 'inactive')) {
      resetVoiceUI();
      return;
    }

    voiceStatusText.innerHTML = 'Traitement en cours...';
    const result = await speechManager.stop();
    resetVoiceUI();

    if (result && result.audioDataUrl) {
      editorRecordedAudio = result;
      showEditorAudioPreview(result.audioDataUrl);
    }
  }

  function resetVoiceUI() {
    micToggleBtn.classList.remove('recording');
    micBtnIcon.textContent = '🎙️';
    micBtnLabel.textContent = 'Parler';
    voiceStatusText.innerHTML = '<span>🎙️ Dictée vocale</span>';
    soundWaveBars.style.display = 'none';
    liveInterimBox.classList.remove('active');
    liveInterimBox.textContent = '';
  }

  function showEditorAudioPreview(audioSrc) {
    editorAudioPreviewBox.style.display = 'block';
    if (editorAudioPlayer) {
      editorAudioPlayer.pause();
    }
    editorAudioPlayer = new Audio(audioSrc);
    editorAudioPlayBtn.textContent = '▶';
    editorAudioProgressBar.style.width = '0%';
    editorAudioCurrentTime.textContent = '0:00';

    editorAudioPlayer.onloadedmetadata = () => {
      editorAudioTotalDuration.textContent = formatDuration(editorAudioPlayer.duration);
    };

    editorAudioPlayer.ontimeupdate = () => {
      if (editorAudioPlayer.duration) {
        const pct = (editorAudioPlayer.currentTime / editorAudioPlayer.duration) * 100;
        editorAudioProgressBar.style.width = pct + '%';
        editorAudioCurrentTime.textContent = formatDuration(editorAudioPlayer.currentTime);
      }
    };

    editorAudioPlayer.onended = () => {
      editorAudioPlayBtn.textContent = '▶';
      editorAudioProgressBar.style.width = '0%';
    };
  }

  editorAudioPlayBtn.addEventListener('click', () => {
    if (!editorAudioPlayer) return;
    if (editorAudioPlayer.paused) {
      editorAudioPlayer.play();
      editorAudioPlayBtn.textContent = '⏸';
    } else {
      editorAudioPlayer.pause();
      editorAudioPlayBtn.textContent = '▶';
    }
  });

  deleteAudioBtn.addEventListener('click', () => {
    if (confirm('Voulez-vous supprimer cette note vocale ?')) {
      if (editorAudioPlayer) {
        editorAudioPlayer.pause();
        editorAudioPlayer = null;
      }
      editorRecordedAudio = null;
      editorAudioPreviewBox.style.display = 'none';
    }
  });

  // ==========================================
  // 9. Gestion des Photos dans l'Éditeur
  // ==========================================
  photoInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    for (const file of files) {
      const dataUrl = await resizeImageToDataUrl(file, 1024, 0.85);
      editorPhotos.push(dataUrl);
    }
    renderEditorPhotosPreview();
    photoInput.value = '';
  });

  function renderEditorPhotosPreview() {
    photosPreviewList.innerHTML = '';
    editorPhotos.forEach((src, idx) => {
      const thumbWrap = document.createElement('div');
      thumbWrap.className = 'preview-thumb-wrapper';
      thumbWrap.innerHTML = `
        <img src="${src}" class="preview-thumb" alt="Preview">
        <button type="button" class="remove-photo-btn" data-idx="${idx}">✕</button>
      `;
      thumbWrap.querySelector('.remove-photo-btn').addEventListener('click', () => {
        editorPhotos.splice(idx, 1);
        renderEditorPhotosPreview();
      });
      photosPreviewList.appendChild(thumbWrap);
    });
  }

  function resizeImageToDataUrl(file, maxWidth = 1024, quality = 0.85) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = readerEvent.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // ==========================================
  // 10. Enregistrement d'un Souvenir
  // ==========================================
  saveEntryBtn.addEventListener('click', async () => {
    // Si la dictée vocale tourne encore, l'arrêter d'abord
    if (speechManager.isListening) {
      await stopVoiceDictation();
    }

    const title = entryTitleInput.value.trim();
    const content = entryContentInput.value.trim();
    const date = entryDateInput.value || getTodayDateString();
    const time = entryTimeInput.value || getCurrentTimeString();
    const mood = getSelectedMood();

    if (!title && !content && !editorRecordedAudio && editorPhotos.length === 0) {
      alert('Veuillez dicter ou écrire un texte, ou enregistrer un message vocal avant de sauvegarder.');
      return;
    }

    // Récupération des tags sélectionnés
    const selectedTags = [];
    tagChoices.forEach(btn => {
      if (btn.classList.contains('active')) {
        selectedTags.push(btn.dataset.tag);
      }
    });

    const memoryObj = {
      id: currentEditingMemory ? currentEditingMemory.id : null,
      title: title || (content ? content.slice(0, 30) + '...' : 'Souvenir vocal'),
      content: content,
      date: date,
      time: time,
      timestamp: new Date(`${date}T${time || '12:00'}`).getTime() || Date.now(),
      mood: mood,
      tags: selectedTags,
      photos: editorPhotos,
      location: editorLocation,
      audio: editorRecordedAudio ? editorRecordedAudio.audioDataUrl : (currentEditingMemory ? currentEditingMemory.audio : null),
      favorite: currentEditingMemory ? !!currentEditingMemory.favorite : false
    };

    await window.JournalDB.saveMemory(memoryObj);
    closeEditor();
    await loadMemories();
    goToDate(memoryObj.date);
  });

  // ==========================================
  // 11. Modal Détail
  // ==========================================
  function openDetailModal(memory) {
    stopAllAudioPlayers();
    currentDetailMemory = memory;

    detailMoodBadge.textContent = memory.mood || '😊';
    detailDateText.textContent = `${formatDateFrench(memory.date)} à ${memory.time || ''}`;
    detailTitleText.textContent = memory.title || '(Sans titre)';
    detailContentText.textContent = memory.content || '(Aucun texte rédigé)';
    detailFavBtn.textContent = memory.favorite ? '★' : '☆';
    detailFavBtn.style.color = memory.favorite ? '#fbbf24' : 'var(--text-main)';

    // Audio dans le détail
    if (memory.audio) {
      detailAudioBox.style.display = 'block';
      detailAudioPlayer = new Audio(memory.audio);
      detailAudioPlayBtn.textContent = '▶';
      detailAudioProgressBar.style.width = '0%';
      detailAudioCurrentTime.textContent = '0:00';

      detailAudioPlayer.onloadedmetadata = () => {
        detailAudioTotalDuration.textContent = formatDuration(detailAudioPlayer.duration);
      };

      detailAudioPlayer.ontimeupdate = () => {
        if (detailAudioPlayer.duration) {
          const pct = (detailAudioPlayer.currentTime / detailAudioPlayer.duration) * 100;
          detailAudioProgressBar.style.width = pct + '%';
          detailAudioCurrentTime.textContent = formatDuration(detailAudioPlayer.currentTime);
        }
      };

      detailAudioPlayer.onended = () => {
        detailAudioPlayBtn.textContent = '▶';
        detailAudioProgressBar.style.width = '0%';
      };
    } else {
      detailAudioBox.style.display = 'none';
      detailAudioPlayer = null;
    }

    // Photos
    detailPhotosGallery.innerHTML = '';
    if (memory.photos && memory.photos.length > 0) {
      memory.photos.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.style.width = '100%';
        img.style.borderRadius = 'var(--radius-md)';
        img.style.border = '1px solid var(--border-color)';
        detailPhotosGallery.appendChild(img);
      });
    }

    // Tags
    detailTagsList.innerHTML = '';
    if (memory.tags && memory.tags.length > 0) {
      memory.tags.forEach(t => {
        const span = document.createElement('span');
        span.className = 'tag-badge';
        span.textContent = '#' + t;
        detailTagsList.appendChild(span);
      });
    }

    // Localisation dans le détail
    if (detailLocationBox && detailLocationLink && detailLocationText) {
      if (memory.location && (memory.location.latitude || memory.location.address)) {
        const mapsUrl = memory.location.mapsUrl || `https://www.google.com/maps?q=${memory.location.latitude},${memory.location.longitude}`;
        const locLabel = memory.location.address || `${memory.location.latitude.toFixed(4)}, ${memory.location.longitude.toFixed(4)}`;
        detailLocationText.textContent = `📍 ${locLabel} (Google Maps)`;
        detailLocationLink.href = mapsUrl;
        detailLocationBox.style.display = 'block';
      } else {
        detailLocationBox.style.display = 'none';
      }
    }

    detailModal.classList.add('active');
  }

  detailAudioPlayBtn.addEventListener('click', () => {
    if (!detailAudioPlayer) return;
    if (detailAudioPlayer.paused) {
      detailAudioPlayer.play();
      detailAudioPlayBtn.textContent = '⏸';
    } else {
      detailAudioPlayer.pause();
      detailAudioPlayBtn.textContent = '▶';
    }
  });

  closeDetailBtn.addEventListener('click', () => {
    stopAllAudioPlayers();
    detailModal.classList.remove('active');
  });

  detailFavBtn.addEventListener('click', async () => {
    if (!currentDetailMemory) return;
    await window.JournalDB.toggleFavorite(currentDetailMemory.id);
    currentDetailMemory.favorite = !currentDetailMemory.favorite;
    detailFavBtn.textContent = currentDetailMemory.favorite ? '★' : '☆';
    detailFavBtn.style.color = currentDetailMemory.favorite ? '#fbbf24' : 'var(--text-main)';
    await loadMemories();
  });

  const detailJumpDayBtn = document.getElementById('detailJumpDayBtn');
  if (detailJumpDayBtn) {
    detailJumpDayBtn.addEventListener('click', () => {
      if (currentDetailMemory && currentDetailMemory.date) {
        const targetDate = currentDetailMemory.date;
        stopAllAudioPlayers();
        detailModal.classList.remove('active');
        goToDate(targetDate);
      }
    });
  }

  detailEditBtn.addEventListener('click', () => {
    if (!currentDetailMemory) return;
    const mem = { ...currentDetailMemory };
    detailModal.classList.remove('active');
    openEditor({ memory: mem });
  });

  detailDeleteBtn.addEventListener('click', async () => {
    if (!currentDetailMemory) return;
    if (confirm('Voulez-vous vraiment supprimer définitivement ce souvenir ?')) {
      await window.JournalDB.deleteMemory(currentDetailMemory.id);
      detailModal.classList.remove('active');
      await loadMemories();
    }
  });

  // ==========================================
  // 12. Calendrier Interactif
  // ==========================================
  const monthNamesFr = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  prevMonthBtn.addEventListener('click', () => {
    calendarCursor.setMonth(calendarCursor.getMonth() - 1);
    renderCalendar();
  });

  nextMonthBtn.addEventListener('click', () => {
    calendarCursor.setMonth(calendarCursor.getMonth() + 1);
    renderCalendar();
  });

  function renderCalendar() {
    const year = calendarCursor.getFullYear();
    const month = calendarCursor.getMonth();

    currentMonthYearLabel.textContent = `${monthNamesFr[month]} ${year}`;
    calendarGrid.innerHTML = '';

    // En-têtes des jours de la semaine
    const dayNames = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
    dayNames.forEach(d => {
      const header = document.createElement('div');
      header.className = 'cal-day-name';
      header.textContent = d;
      calendarGrid.appendChild(header);
    });

    // Premier jour du mois (0 = Dimanche, 1 = Lundi, etc.)
    const firstDay = new Date(year, month, 1).getDay();
    // Ajuster pour commencer le Lundi (1=0, 2=1 ... 0=6)
    const startOffset = (firstDay + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Jours vides au début
    for (let i = 0; i < startOffset; i++) {
      const emptyCell = document.createElement('div');
      calendarGrid.appendChild(emptyCell);
    }

    const todayStr = getTodayDateString();

    // Dictionnaire des souvenirs par date
    const memoriesByDate = {};
    allMemories.forEach(m => {
      if (!memoriesByDate[m.date]) memoriesByDate[m.date] = [];
      memoriesByDate[m.date].push(m);
    });

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const cell = document.createElement('div');
      cell.className = 'cal-cell';
      cell.textContent = day;

      if (dateStr === todayStr) {
        cell.classList.add('today');
      }

      if (dateStr === selectedCalendarDate) {
        cell.classList.add('selected');
      }

      if (memoriesByDate[dateStr] && memoriesByDate[dateStr].length > 0) {
        const dot = document.createElement('div');
        dot.className = 'cal-dot';
        cell.appendChild(dot);
      }

      cell.addEventListener('click', () => {
        selectedCalendarDate = dateStr;
        renderCalendar();
        renderCalendarSelectedDayMemories(memoriesByDate[dateStr] || []);
      });

      calendarGrid.appendChild(cell);
    }

    renderCalendarSelectedDayMemories(memoriesByDate[selectedCalendarDate] || []);
  }

  function renderCalendarSelectedDayMemories(dayMemories) {
    selectedDayTitle.textContent = `Souvenirs du ${formatDateFrench(selectedCalendarDate)}`;
    calendarDayMemories.innerHTML = '';

    if (dayMemories.length === 0) {
      calendarDayMemories.innerHTML = `
        <div style="text-align:center; padding: 20px; color: var(--text-sub); font-size: 0.85rem;">
          Aucun souvenir enregistré pour ce jour.
        </div>
      `;
      return;
    }

    dayMemories.forEach(m => {
      calendarDayMemories.appendChild(createMemoryCardElement(m));
    });
  }

  // ==========================================
  // 13. Statistiques & Rétrospective
  // ==========================================
  function renderStats() {
    // 1. Total souvenirs
    statTotalNotes.textContent = allMemories.length;

    // 2. Mots écrits au total
    let totalWords = 0;
    const moodCounts = {};

    allMemories.forEach(m => {
      if (m.content) {
        totalWords += m.content.trim().split(/\s+/).length;
      }
      if (m.mood) {
        moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
      }
    });

    statTotalWords.textContent = totalWords;

    // 3. Humeur la plus fréquente
    let topMood = '-';
    let maxCount = 0;
    for (const [mood, count] of Object.entries(moodCounts)) {
      if (count > maxCount) {
        maxCount = count;
        topMood = mood;
      }
    }
    statTopMood.textContent = topMood;

    // 4. Streak (jours consécutifs)
    statStreak.textContent = calculateStreak(allMemories);

    // 5. Ce jour-là dans le passé
    renderThrowback();

    // 6. Barres d'humeur
    renderMoodBars(moodCounts, allMemories.length);
  }

  function calculateStreak(memories) {
    if (memories.length === 0) return 0;
    const dates = new Set(memories.map(m => m.date));
    let streak = 0;
    let checkDate = new Date();

    // Vérifier si aujourd'hui ou hier a un souvenir
    const todayStr = checkDate.toISOString().split('T')[0];
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = checkDate.toISOString().split('T')[0];

    if (!dates.has(todayStr) && !dates.has(yesterdayStr)) {
      return 0;
    }

    let cursor = dates.has(todayStr) ? new Date() : checkDate;
    while (true) {
      const dStr = cursor.toISOString().split('T')[0];
      if (dates.has(dStr)) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  function renderThrowback() {
    throwbackContainer.innerHTML = '';
    if (allMemories.length === 0) {
      throwbackContainer.innerHTML = '<p style="color:var(--text-sub);font-size:0.85rem;">Enregistrez quelques souvenirs pour revoir vos moments passés !</p>';
      return;
    }

    // Rechercher un souvenir du même jour mais d'une date antérieure, sinon prendre un souvenir aléatoire
    const today = new Date();
    const currentMonthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    let throwback = allMemories.find(m => {
      if (!m.date) return false;
      const parts = m.date.split('-');
      return `${parts[1]}-${parts[2]}` === currentMonthDay && parts[0] < today.getFullYear();
    });

    if (!throwback) {
      // Choisir un souvenir inspirant parmi les favoris ou aléatoire
      const favorites = allMemories.filter(m => m.favorite);
      const pool = favorites.length > 0 ? favorites : allMemories;
      throwback = pool[Math.floor(Math.random() * pool.length)];
    }

    if (throwback) {
      const card = createMemoryCardElement(throwback);
      throwbackContainer.appendChild(card);
    }
  }

  function renderMoodBars(moodCounts, total) {
    moodStatsList.innerHTML = '';
    if (total === 0) return;

    const moodLabels = {
      '😊': 'Heureux',
      '😌': 'Paisible',
      '⚡': 'Énergique',
      '💖': 'Reconnaissant',
      '🤔': 'Pensif',
      '😴': 'Fatigué',
      '😢': 'Triste',
      '🤯': 'Débordé'
    };

    Object.entries(moodCounts).forEach(([mood, count]) => {
      const pct = Math.round((count / total) * 100);
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.gap = '10px';
      row.style.fontSize = '0.85rem';

      row.innerHTML = `
        <span style="font-size:1.2rem;width:24px;">${mood}</span>
        <span style="width:100px;color:var(--text-muted);">${moodLabels[mood] || 'Humeur'}</span>
        <div style="flex:1;height:8px;background:var(--bg-input);border-radius:4px;overflow:hidden;">
          <div style="width:${pct}%;height:100%;background:var(--primary);border-radius:4px;"></div>
        </div>
        <span style="width:36px;text-align:right;font-weight:600;">${pct}%</span>
      `;
      moodStatsList.appendChild(row);
    });
  }

  // ==========================================
  // 14. Mot de Passe & Protection Intimité
  // ==========================================
  function lockApp() {
    if (appPasswordInput) {
      appPasswordInput.value = '';
    }
    if (passwordErrorMsg) {
      passwordErrorMsg.textContent = '';
    }
    pinScreen.classList.add('active');
    setTimeout(() => {
      if (appPasswordInput) appPasswordInput.focus();
    }, 100);
  }

  function unlockApp() {
    const inputVal = appPasswordInput.value.trim();
    if (!userPassword) {
      pinScreen.classList.remove('active');
      return;
    }
    if (inputVal === userPassword) {
      pinScreen.classList.remove('active');
      passwordErrorMsg.textContent = '';
      appPasswordInput.value = '';
    } else {
      passwordErrorMsg.textContent = '❌ Mot de passe incorrect';
      appPasswordInput.style.borderColor = 'var(--danger)';
      setTimeout(() => {
        if (appPasswordInput) appPasswordInput.style.borderColor = 'var(--border-color)';
      }, 800);
    }
  }

  if (unlockAppBtn) {
    unlockAppBtn.addEventListener('click', unlockApp);
  }

  if (appPasswordInput) {
    appPasswordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        unlockApp();
      }
    });
  }

  if (togglePassEyeBtn) {
    togglePassEyeBtn.addEventListener('click', () => {
      if (appPasswordInput.type === 'password') {
        appPasswordInput.type = 'text';
        togglePassEyeBtn.textContent = '🔒';
      } else {
        appPasswordInput.type = 'password';
        togglePassEyeBtn.textContent = '👁️';
      }
    });
  }

  // Pavé numérique rapide
  pinKeys.forEach(btn => {
    btn.addEventListener('click', () => {
      appPasswordInput.value += btn.dataset.num;
      passwordErrorMsg.textContent = '';
      if (userPassword && appPasswordInput.value.length === userPassword.length && appPasswordInput.value === userPassword) {
        unlockApp();
      }
    });
  });

  if (pinDeleteBtn) {
    pinDeleteBtn.addEventListener('click', () => {
      if (appPasswordInput.value.length > 0) {
        appPasswordInput.value = appPasswordInput.value.slice(0, -1);
      }
    });
  }

  if (pinClearBtn) {
    pinClearBtn.addEventListener('click', () => {
      appPasswordInput.value = '';
      passwordErrorMsg.textContent = '';
    });
  }

  // Bouton de verrouillage immédiat dans le header
  if (lockAppBtn) {
    lockAppBtn.addEventListener('click', () => {
      if (!userPassword) {
        const setup = confirm("Vous n'avez pas encore défini de mot de passe pour protéger votre intimité.\nVoulez-vous en configurer un maintenant ?");
        if (setup) {
          configureNewPassword();
        }
      } else {
        lockApp();
      }
    });
  }

  async function configureNewPassword() {
    const newPass = prompt("Définissez un mot de passe ou code secret pour verrouiller votre journal :");
    if (newPass && newPass.trim().length >= 2) {
      const trimmed = newPass.trim();
      await window.JournalDB.setSetting('appPassword', trimmed);
      await window.JournalDB.setSetting('pinCode', trimmed);
      userPassword = trimmed;
      currentPinDesc.textContent = 'Activé (Protégé)';
      alert("✅ Mot de passe configuré avec succès ! Votre journal est maintenant protégé.");
    } else if (newPass !== null) {
      alert("Veuillez saisir un mot de passe d'au moins 2 caractères.");
    }
  }

  settingPinBtn.addEventListener('click', async () => {
    if (userPassword) {
      if (confirm('Voulez-vous désactiver la protection par mot de passe ?')) {
        await window.JournalDB.setSetting('appPassword', null);
        await window.JournalDB.setSetting('pinCode', null);
        userPassword = null;
        currentPinDesc.textContent = 'Désactivé';
        alert('Protection par mot de passe désactivée.');
      }
    } else {
      await configureNewPassword();
    }
  });

  // ==========================================
  // 15. Sauvegarde et Restauration
  // ==========================================
  exportBackupBtn.addEventListener('click', async () => {
    const jsonStr = await window.JournalDB.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal-memoire-sauvegarde-${getTodayDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  importBackupBtn.addEventListener('click', () => {
    backupFileInput.click();
  });

  backupFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const count = await window.JournalDB.importFullBackup(event.target.result);
        alert(`Restauration réussie ! ${count} souvenirs ont été récupérés.`);
        backupFileInput.value = '';
        await loadMemories();
      } catch (err) {
        alert('Erreur lors de la restauration du fichier : ' + err.message);
      }
    };
    reader.readAsText(file);
  });

  clearAllDataBtn.addEventListener('click', async () => {
    if (confirm('ATTENTION : Voulez-vous vraiment effacer TOUS vos souvenirs sur cet appareil ? Cette action est irréversible.')) {
      if (prompt('Tapez "SUPPRIMER" pour confirmer :') === 'SUPPRIMER') {
        const memories = await window.JournalDB.getAllMemories();
        for (const m of memories) {
          await window.JournalDB.deleteMemory(m.id);
        }
        await loadMemories();
        alert('Toutes les données ont été effacées.');
      }
    }
  });

  installPwaBtn.addEventListener('click', () => {
    alert(
      "Pour installer l'application sur votre smartphone Android :\n\n" +
      "1. Ouvrez l'adresse de votre journal dans Google Chrome.\n" +
      "2. Appuyez sur le menu (les 3 petits points ⋮ en haut à droite).\n" +
      "3. Cliquez sur 'Installer l'application' ou 'Ajouter à l'écran d'accueil'.\n\n" +
      "L'icône apparaîtra sur votre écran et s'ouvrira en plein écran comme une vraie application !"
    );
  });

  // ==========================================
  // 16. Écouteurs de navigation et UI
  // ==========================================
  function setupEventListeners() {
    // Navigation par onglets
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        stopAllAudioPlayers();
        const targetView = item.dataset.view;
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        Object.entries(views).forEach(([vKey, vEl]) => {
          vEl.classList.toggle('active', vKey === targetView);
        });
        activeView = targetView;

        if (targetView === 'viewStats') {
          renderStats();
        } else if (targetView === 'viewCalendar') {
          renderCalendar();
        }
      });
    });

    // Thème
    themeToggleBtn.addEventListener('click', toggleTheme);
    settingThemeBtn.addEventListener('click', toggleTheme);

    // Langue de dictée
    const langLabels = {
      'ar-DZ': '🇩🇿 الدارجة الجزائرية (ar-DZ)',
      'fr-FR': '🇫🇷 Français (France)',
      'ar-SA': '🇸🇦 العربية الفصحى (ar-SA)',
      'en-US': '🇬🇧 English (US)'
    };

    if (voiceLangSelect) {
      voiceLangSelect.addEventListener('change', async (e) => {
        const chosen = e.target.value;
        speechManager.lang = chosen;
        await window.JournalDB.setSetting('voiceLang', chosen);
        currentLangDesc.textContent = langLabels[chosen] || chosen;
      });
    }

    settingVoiceLangBtn.addEventListener('click', async () => {
      const langs = ['ar-DZ', 'fr-FR', 'ar-SA', 'en-US'];
      const currentIdx = langs.indexOf(speechManager.lang);
      const nextLang = langs[(currentIdx + 1) % langs.length];
      speechManager.lang = nextLang;
      if (voiceLangSelect) voiceLangSelect.value = nextLang;
      await window.JournalDB.setSetting('voiceLang', nextLang);
      currentLangDesc.textContent = langLabels[nextLang] || nextLang;
      alert(`Langue vocale changée pour : ${langLabels[nextLang] || nextLang}`);
    });

    // Navigation Jour par Jour (Chaque jour est seul)
    if (prevDayBtn) prevDayBtn.addEventListener('click', () => changeDayOffset(-1));
    if (nextDayBtn) nextDayBtn.addEventListener('click', () => changeDayOffset(1));
    if (jumpTodayBtn) jumpTodayBtn.addEventListener('click', () => goToDate(getTodayDateString()));
    
    const triggerDatePick = () => {
      if (dayDirectDatePicker.showPicker) {
        dayDirectDatePicker.showPicker();
      } else {
        dayDirectDatePicker.focus();
        dayDirectDatePicker.click();
      }
    };
    if (chooseDatePillBtn) chooseDatePillBtn.addEventListener('click', triggerDatePick);
    if (dayPickerTrigger) dayPickerTrigger.addEventListener('click', triggerDatePick);
    if (dayDirectDatePicker) {
      dayDirectDatePicker.addEventListener('change', (e) => {
        if (e.target.value) {
          goToDate(e.target.value);
        }
      });
    }

    // Bascule entre "Fiche du jour unique" et "Tous les jours"
    if (toggleTimelineModeBtn) {
      toggleTimelineModeBtn.addEventListener('click', () => {
        if (journalMode === 'single') {
          journalMode = 'all';
          toggleTimelineModeBtn.textContent = '📅 Revenir au jour unique';
          toggleTimelineModeBtn.classList.add('active');
          renderDayView();
        } else {
          journalMode = 'single';
          toggleTimelineModeBtn.textContent = '📜 Afficher tous les jours';
          toggleTimelineModeBtn.classList.remove('active');
          renderDayView();
        }
      });
    }

    // Recherche
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (searchQuery.trim().length > 0) {
        journalMode = 'search';
      } else {
        journalMode = 'single';
      }
      applyFilters();
    });

    // Filtres d'humeur
    moodFilterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        moodFilterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeMoodFilter = btn.dataset.mood;
        applyFilters();
      });
    });

    // FABs
    fabVoiceBtn.addEventListener('click', () => openEditor({ startVoice: true }));
    quickVoiceHeaderBtn.addEventListener('click', () => openEditor({ startVoice: true }));
    fabAddBtn.addEventListener('click', () => openEditor({ startVoice: false }));

    // Bouton micro dans l'éditeur
    micToggleBtn.addEventListener('click', () => {
      if (speechManager.isListening) {
        stopVoiceDictation();
      } else {
        startVoiceDictation();
      }
    });

    // Fermeture éditeur
    closeEditorBtn.addEventListener('click', closeEditor);
    cancelEditorBtn.addEventListener('click', closeEditor);

    // Humeur dans l'éditeur
    editorMoodOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        setSelectedMood(opt.dataset.mood);
      });
    });

    // Tags dans l'éditeur
    tagChoices.forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
      });
    });

    // Localisation dans l'éditeur
    if (btnGetLocation) {
      btnGetLocation.addEventListener('click', getCurrentLocation);
    }
    if (removeLocationBtn) {
      removeLocationBtn.addEventListener('click', () => {
        editorLocation = null;
        renderEditorLocation();
      });
    }

    // Compteur de mots
    entryContentInput.addEventListener('input', updateWordCount);
  }

  // ==========================================
  // 17. Utilitaires
  // ==========================================
  function getTodayDateString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function getCurrentTimeString() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  function formatDateFrench(dateStr) {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  }

  function formatDuration(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
        .then(() => console.log('Service Worker enregistré avec succès'))
        .catch(err => console.warn('Erreur Service Worker:', err));
    }
  }

  // Démarrage
  await initApp();
});
