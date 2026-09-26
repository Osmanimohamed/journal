/**
 * speech.js - Gestion de la reconnaissance vocale et de l'enregistrement audio
 * Utilise l'API Web Speech native et l'API MediaRecorder.
 */

const SpeechRecClass = window.SpeechRecognition || window.webkitSpeechRecognition;

class SpeechManager {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.mediaRecorder = null;
    this.audioStream = null;
    this.audioChunks = [];
    this.audioBlob = null;
    this.audioDataUrl = null;
    this.recordAudioFile = true; // Par défaut, enregistre aussi le fichier audio
    this.lang = 'fr-FR';
    
    // Audio analyzer pour les visualisations d'ondes sonores
    this.audioCtx = null;
    this.analyser = null;
    this.animFrameId = null;

    // Callbacks
    this.onInterimResult = null;
    this.onFinalResult = null;
    this.onStatusChange = null;
    this.onAudioVolume = null;

    this.initRecognition();
  }

  isSpeechRecognitionSupported() {
    return !!SpeechRecClass;
  }

  isMediaRecorderSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  }

  initRecognition() {
    if (!this.isSpeechRecognitionSupported()) {
      console.warn('Reconnaissance vocale Web Speech non supportée sur ce navigateur.');
      return;
    }

    try {
      this.recognition = new SpeechRecClass();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.lang;

      this.recognition.onstart = () => {
        this.isListening = true;
        this._notifyStatus('listening', 'Écoute en cours... Parlez naturellement');
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += this.formatPunctuation(transcript) + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript && this.onFinalResult) {
          this.onFinalResult(finalTranscript);
        }
        if (this.onInterimResult) {
          this.onInterimResult(interimTranscript);
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('Erreur SpeechRecognition:', event.error);
        if (event.error === 'not-allowed') {
          this._notifyStatus('error', 'Accès au microphone refusé. Autorisez le micro dans Chrome.');
          this.stop();
        } else if (event.error === 'no-speech') {
          this._notifyStatus('warning', 'Aucune voix détectée.');
        } else {
          this._notifyStatus('error', `Erreur vocale: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        // Si l'utilisateur n'a pas arrêté manuellement, redémarrer
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch (e) {
            this.isListening = false;
            this._notifyStatus('idle', 'Prêt');
          }
        } else {
          this._notifyStatus('idle', 'Prêt');
        }
      };
    } catch (err) {
      console.error('Erreur initialisation SpeechRecognition:', err);
    }
  }

  // Remplacement intelligent des commandes de ponctuation orales (Français & Arabe/Darija)
  formatPunctuation(text) {
    let t = text;
    // Français
    t = t.replace(/\bvirgule\b/gi, ',');
    t = t.replace(/\bpoint d'exclamation\b/gi, ' !');
    t = t.replace(/\bpoint d'interrogation\b/gi, ' ?');
    t = t.replace(/\bpoints de suspension\b/gi, '...');
    t = t.replace(/\bdeux points\b/gi, ':');
    t = t.replace(/\bpoint\b/gi, '.');
    t = t.replace(/\bà la ligne\b/gi, '\n');
    t = t.replace(/\bnouveau paragraphe\b/gi, '\n\n');
    t = t.replace(/\btiret\b/gi, '-');
    t = t.replace(/\bouvrez les guillemets\b/gi, ' « ');
    t = t.replace(/\bfermez les guillemets\b/gi, ' » ');

    // Arabe & Darija
    t = t.replace(/\bفاصلة\b/g, '،');
    t = t.replace(/\bنقطة\b/g, '.');
    t = t.replace(/\bنقطتين\b/g, ':');
    t = t.replace(/\bعلامة استفهام\b/g, '؟');
    t = t.replace(/\bعلامة تعجب\b/g, '!');
    t = t.replace(/\b(سطر جديد|رجع للسطر)\b/g, '\n');
    t = t.replace(/\bثلاث نقاط\b/g, '...');
    
    // Nettoyer les espaces avant les ponctuations simples
    t = t.replace(/\s+([.,;:،؟])/g, '$1');
    return t;
  }

  _notifyStatus(state, message) {
    if (this.onStatusChange) {
      this.onStatusChange(state, message);
    }
  }

  // Démarrer l'écoute vocale et éventuellement l'enregistrement audio
  async start({ withAudioRecord = true, lang = 'fr-FR' } = {}) {
    this.recordAudioFile = withAudioRecord;
    this.lang = lang;
    this.audioChunks = [];
    this.audioBlob = null;
    this.audioDataUrl = null;

    if (this.recognition) {
      this.recognition.lang = this.lang;
    }

    // Demander le microphone pour l'enregistrement audio et l'onde sonore
    if (this.isMediaRecorderSupported()) {
      try {
        this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this._startAudioVisualizer(this.audioStream);

        if (this.recordAudioFile) {
          let mimeType = 'audio/webm';
          if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            mimeType = 'audio/webm;codecs=opus';
          } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
            mimeType = 'audio/mp4';
          } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
            mimeType = 'audio/ogg';
          }

          this.mediaRecorder = new MediaRecorder(this.audioStream, { mimeType });
          this.mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              this.audioChunks.push(e.data);
            }
          };
          this.mediaRecorder.start(250); // morceaux toutes les 250ms
        }
      } catch (err) {
        console.warn('Microphone inaccessible pour MediaRecorder:', err);
      }
    }

    if (this.recognition) {
      try {
        this.isListening = true;
        this.recognition.start();
      } catch (e) {
        // Déjà démarré
      }
    }
  }

  // Arrêter l'écoute et l'enregistrement
  async stop() {
    this.isListening = false;

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }

    this._stopAudioVisualizer();

    // Arrêter le MediaRecorder et créer le Blob / base64
    return new Promise((resolve) => {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.onstop = async () => {
          if (this.audioChunks.length > 0) {
            const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
            this.audioBlob = new Blob(this.audioChunks, { type: mimeType });
            this.audioDataUrl = await this._blobToBase64(this.audioBlob);
          }
          this._cleanStream();
          this._notifyStatus('idle', 'Enregistrement terminé');
          resolve({
            audioBlob: this.audioBlob,
            audioDataUrl: this.audioDataUrl
          });
        };
        this.mediaRecorder.stop();
      } else {
        this._cleanStream();
        this._notifyStatus('idle', 'Prêt');
        resolve({
          audioBlob: null,
          audioDataUrl: null
        });
      }
    });
  }

  _cleanStream() {
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }
  }

  _blobToBase64(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  _startAudioVisualizer(stream) {
    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtxClass) return;
      this.audioCtx = new AudioCtxClass();
      const source = this.audioCtx.createMediaStreamSource(stream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!this.isListening) return;
        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength; // 0 à 255
        const volumeRatio = Math.min(1, avg / 120); // normalisé 0 à 1
        if (this.onAudioVolume) {
          this.onAudioVolume(volumeRatio);
        }
        this.animFrameId = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (e) {
      console.warn('AudioVisualizer non initialisé:', e);
    }
  }

  _stopAudioVisualizer() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch (e) {}
      this.audioCtx = null;
    }
    if (this.onAudioVolume) {
      this.onAudioVolume(0);
    }
  }
}

window.SpeechManager = SpeechManager;
