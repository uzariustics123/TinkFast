import React, { createElement } from 'react'
// import Icon from '@mdi/react'
// import {
//     mdiNpm,
//     mdiMenu,
//     mdiGithub,
//     mdiLightbulb,
//     mdiLightbulbOutline
// } from '@mdi/js'

import { H2, H6, Card, IconButton, ToggleButton } from 'ui-neumorphism'

const npmUrl = 'https://www.npmjs.com/package/ui-neumorphism'
const githubUrl = 'https://github.com/AKAspanion/ui-neumorphism'

class Topbar extends React.Component {
    open(url) {
        window.open(url, '_blank')
    }

    render() {
        const { dark, onClick, onMenuClick, size } = this.props
        const isSmall = size === 'sm' || size === 'xs'
        const menuButton = isSmall ? (
            <IconButton onClick={onMenuClick}>
                <span class="material-icons">star</span>
            </IconButton>
        ) : null

        const title = createElement(
            isSmall ? H6 : H2,
            { style: { color: 'var(--primary)' }, className: 'topbar-title' },
            'TinkFast'
        )

        return (
            <Card flat dark={dark} className={`main-topbar`}>
                <Card flat className='d-flex align-center topbar-headline'>
                    {menuButton}
                    {title}
                </Card>
                <Card flat className='d-flex align-center topbar-actions'>
                    <IconButton
                        className='topbar-action mr-1'
                        onClick={() => this.open(npmUrl)}
                    >
                        <span class="material-icons">star</span>
                    </IconButton>
                    <IconButton
                        className='topbar-action'
                        onClick={() => this.open(githubUrl)}
                    >
                        <span class="material-icons">star</span>
                    </IconButton>
                    <ToggleButton className='topbar-action' onChange={onClick}>
                        <span class="material-icons">star</span>
                    </ToggleButton>
                </Card>
            </Card>
        )
    }
}

export default Topbar