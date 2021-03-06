import React, {Component} from 'react';
import {Words} from './Words';

export class Main extends Component {

    state = {
        languageId: 2,
        word: {
            id: null,
            name: '',
            genderId: 0,
            transcription: '',
            translation: '',
            created: '',
        },
        words: []
    };

    constructor(props) {
        super(props);

        this.handleLanguageChange = this.handleLanguageChange.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleTranscriptionChange = this.handleTranscriptionChange.bind(this);
        this.handleGenderChange = this.handleGenderChange.bind(this);
        this.handleTranslationChange = this.handleTranslationChange.bind(this);

        this.handleSelectWord = this.handleSelectWord.bind(this);

        this.handleSave = this.handleSave.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);

        this.cleanAndFetch = this.cleanAndFetch.bind(this);
        this.escFunction = this.escFunction.bind(this);
    }

    escFunction(event) {
        if (event.keyCode === 27) { // Escape key pressed.
            this.cleanAndFetch();
        }
    }

    async componentDidMount() {
        document.addEventListener("keydown", this.escFunction, false);

        await this.fetchWords();
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.escFunction, false);
    }

    render() {
        let saveDisabled =
            !(this.state.word.name.length > 0 && this.state.word.translation.length > 0);

        return (
            <div>
                <select id="language-select"
                        onChange={this.handleLanguageChange}>
                    <option value={2}>Français</option>
                    <option value={1}>English</option>
                    <option value={4}>Русский</option>
                </select>
                <div id="name-translation-container">
                    <input id="name"
                           value={this.state.word.name}
                           onChange={this.handleNameChange}
                           placeholder="Слово"/>

                    <input id="transcription"
                           value={this.state.word.transcription}
                           onChange={this.handleTranscriptionChange}
                           placeholder="Транскрипция"/>

                    <label id="clean-label"
                           onClick={() => this.cleanAndFetch()}>Очистить</label>
                    <label id="delete-label"
                           onClick={this.delete}>Удалить</label>
                </div>
                <div id="gender-container">
                    <label>m</label><input type="checkbox" checked={this.state.word.genderId === 1}
                                           onChange={() => this.handleGenderChange(1)}/>
                    <label>f</label><input type="checkbox" checked={this.state.word.genderId === 2}
                                           onChange={() => this.handleGenderChange(2)}/>
                </div>
                <textarea id="translation"
                          value={this.state.word.translation}
                          placeholder="Перевод"
                          onChange={this.handleTranslationChange}
                          rows="5"/>
                <button id="save-btn"
                        disabled={saveDisabled}
                        onClick={this.handleSave}>Сохранить
                </button>
                <Words words={this.state.words}
                       onWordSelect={this.handleSelectWord}/>
            </div>);
    }

    handleLanguageChange(e) {
        this.setState({
            languageId: parseInt(e.target.value, 10)
        }, () => {
            this.cleanAndFetch();
        });
    }

    handleNameChange(e) {
        this.setState({
            word: {
                id: null,
                name: e.target.value,
                genderId: 0,
                transcription: '',
                translation: ''
            }
        }, async () => {
            await this.fetchWords();
        });
    }

    handleTranscriptionChange(e) {
        this.setState({
            word: {
                ...this.state.word,
                transcription: e.target.value
            }
        });
    }

    handleGenderChange(genderId) {
        let resultingGenderId = 0;

        if (genderId !== this.state.word.genderId) {
            resultingGenderId = genderId;
        }

        this.setState({
            word: {
                ...this.state.word,
                genderId: resultingGenderId
            }
        });
    }

    handleTranslationChange(e) {
        this.setState({
            word: {
                ...this.state.word,
                translation: e.target.value
            }
        });
    }

    handleSave() {
        this.state.word.id == null ? this.create() : this.update();
    }

    async create() {
        await fetch('api/v1/word/create', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                LanguageId: this.state.languageId,
                Name: this.state.word.name,
                Transcription: this.state.word.transcription,
                GenderId: this.state.word.genderId,
                Translation: this.state.word.translation
            })
        });

        this.cleanAndFetch();
    }

    async update() {
        let word = this.state.word;

        await fetch('api/v1/word/update', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                WordId: word.id,
                LanguageId: this.state.languageId,
                GenderId: word.genderId,
                Name: word.name,
                Transcription: word.transcription,
                Translation: word.translation
            })
        });

        this.cleanAndFetch();
    }

    async delete() {
        let word = this.state.word;
        if (word.id != null) {
            if (window.confirm(`Удалить слово "${word.name}"?`)) {
                await fetch('api/v1/word/delete', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        Id: word.id,
                    })
                });

                this.cleanAndFetch();
            }
        }
    }

    cleanAndFetch() {
        this.setState({
            word: {
                id: null,
                name: '',
                genderId: 0,
                transcription: '',
                translation: ''
            }
        }, async () => {
            await this.fetchWords();
        });
    }

    async fetchWords() {
        let url = `api/v1/word/list?l=${this.state.languageId}`;

        const term = this.state.word.name.trim();

        if (term !== '') {
            url = `api/v1/word/search?l=${this.state.languageId}&q=${term}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        this.setState({words: data});
    }

    handleSelectWord(word) {
        this.setState({
            word: {
                id: word.wordId,
                name: word.name,
                genderId: word.genderId,
                transcription: word.transcription ?? '',
                translation: word.translation,
                created: word.created
            },
            words: []
        });
    }
}