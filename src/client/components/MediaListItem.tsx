import { autorun } from 'mobx'
import * as React from 'react'
import { inject, observer } from 'mobx-react'
import { IAppState } from '../app-state'

require('./MediaListItem.less')

interface IMediaListItemProps {
    uuid: string
    onLoad: () => void
}

@inject('appState')
@observer
export class MediaListItem extends React.Component<IMediaListItemProps & IAppState, {}> {
    constructor(props) {
        super(props)
    }

    private ref = React.createRef<HTMLDivElement>()
    private stopAutoScrollIntoView

    componentDidMount() {
        const {appState, uuid} = this.props
        let self = this
        this.stopAutoScrollIntoView = autorun(() => {
            const current: HTMLElement = self.ref.current
            if (appState.zoomedItemId === uuid) {
                const {height, bottom} = current.getBoundingClientRect()
                const isInViewport =
                    bottom > appState.pageScrolled + height * 0.3 && bottom < appState.pageScrolled + window.innerHeight
                if (!isInViewport) {
                    current.scrollIntoView({
                        behavior: 'smooth',
                        inline: 'nearest'
                    })
                }
            }
        })
    }

    componentWillUnmount() {
        this.stopAutoScrollIntoView()
    }

    clickHandler = (event) => {
        const {appState, uuid} = this.props
        if (event.shiftKey) {
            appState.toggleSelected(this.props.uuid)
        } else {
            appState.setZoomed(uuid)
        }
    }

    render() {
        const {appState, uuid, onLoad} = this.props
        const {selectedUUIDs} = appState
        const mediaItem = appState.media.find((item) => item.uuid === uuid)
        const {url, focused, type, width, height} = mediaItem
        const aspectPadding = (height / width) * 100
        const selected = selectedUUIDs.indexOf(uuid) !== -1
        return (
            <div
                ref={this.ref}
                onMouseEnter={() => {
                    appState.setHoveredId(uuid)
                }}
                onMouseLeave={() => {
                    appState.setHoveredId(null)
                }}
            >
                <div
                    className={`
                                MediaListItem__outer
                                ${selected ? 'selected' : ''}
                                ${focused ? 'focused' : ''}
                            `}
                >
                    <div className='MediaListItem__aspect' style={{paddingBottom: aspectPadding + '%'}}>
                        <div className='MediaListItem__aspect_inner'>
                            {type === 'img' && (
                                <img
                                    onClick={this.clickHandler}
                                    src={url}
                                    className={`MediaListItem`}
                                    alt={uuid}
                                    onLoad={onLoad}
                                />
                            )}

                            {type === 'video' && (
                                <video
                                    controls
                                    onClick={this.clickHandler}
                                    src={url}
                                    className={`MediaListItem`}
                                    onLoad={onLoad}
                                    width='100%'
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
