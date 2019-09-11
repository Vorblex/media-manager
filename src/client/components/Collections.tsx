import * as React from 'react'
import {inject, observer} from 'mobx-react'
import {IAppState} from '../app-state'
import {RouterLink} from './RouterLink'
import {deleteCollection, renameCollection, shareCollection, unShareCollection} from '../api'
import copy = require('copy-to-clipboard')

interface IProps {}

interface IState {
    text: string
    disabled: boolean
}

@inject('appState')
@observer
export class Collections extends React.Component<IProps & IAppState, IState> {
    constructor(props) {
        super(props)
        this.state = {
            text: '',
            disabled: false
        }
    }

    componentDidMount(): void {
        this.props.appState.refreshCollectionsList()
    }

    render() {
        const {appState} = this.props
        return (
            <div>
                <h2>Коллекции</h2>
                <form
                    onSubmit={async (event) => {
                        event.preventDefault()
                        this.setState({disabled: true})
                        const res = await appState.createCollection(this.state.text)
                        this.setState({disabled: false})
                        if (res) {
                            this.setState({text: ''})
                            appState.refreshCollectionsList()
                        }
                    }}
                >
                    <input
                        value={this.state.text}
                        type='text'
                        onChange={(event) => {
                            this.setState({
                                text: event.target.value
                            })
                        }}
                        placeholder='Название новой коллекции'
                        disabled={this.state.disabled}
                    />{' '}
                    <button disabled={this.state.disabled}>Создать</button>
                </form>
                <ul>
                    {appState.collections.map((collection) => {
                        const collectionUrl = appState.router.getFullUrl({
                            replace: {pathSegments: ['c', collection.uri]}
                        })
                        let collectionLinkUrl
                        let isActiveCollection =
                            appState.router.pathSegments.length >= 2 &&
                            appState.router.pathSegments[1] === collection.uri
                        if (isActiveCollection) {
                            collectionLinkUrl = appState.router.getFullUrl({replace: {pathSegments: []}})
                        } else {
                            collectionLinkUrl = collectionUrl
                        }
                        return (
                            <li key={collection.uri}>
                                <button
                                    onClick={async () => {
                                        if (confirm(`Удалить коллекцию "${collection.title}" безвозвратно?`)) {
                                            await deleteCollection({collectionId: collection._id})
                                            await appState.refreshCollectionsList()
                                            if (isActiveCollection) {
                                                appState.router.replaceUrl(
                                                    appState.router.getFullUrl({replace: {pathSegments: []}})
                                                )
                                            }
                                        }
                                    }}
                                >
                                    Удалить
                                </button>
                                <button
                                    onClick={async () => {
                                        const newTitle = (prompt('Новое имя коллекции', collection.title) || '').trim()
                                        if (newTitle) {
                                            await renameCollection({
                                                collectionId: collection._id,
                                                newTitle: newTitle
                                            })
                                            appState.refreshCollectionsList()
                                        }
                                    }}
                                >
                                    Переименовать
                                </button>
                                <button
                                    onClick={async () => {
                                        copy(collectionUrl)
                                        await shareCollection({id: collection._id})
                                        appState.refreshCollectionsList()
                                    }}
                                >
                                    {collection.public ? 'Скопировать ссылку' : 'Поделиться'}
                                </button>
                                <button
                                    disabled={!collection.public}
                                    onClick={async () => {
                                        await unShareCollection({id: collection._id})
                                        appState.refreshCollectionsList()
                                    }}
                                >
                                    Закрыть доступ
                                </button>
                                <RouterLink url={collectionLinkUrl} className={isActiveCollection ? 'remove' : 'with'}>
                                    {collection.title}
                                </RouterLink>
                            </li>
                        )
                    })}
                </ul>
            </div>
        )
    }
}