import React, { Component } from 'react'
import { Scene, Actor, Staff } from '../../../../src/Teatrum'
export default class CommonPage extends Component {
  componentDidMount() {
    setTimeout(() => {
      Staff.history('teatrum').push('/2')
    }, 5000)
  }

  /**
   * Renderiza o componente
   */
  render() {
    return (
      <div>
        <Scene name="teste2" style={{ color: 'blue' }}>
          <span>test2</span>
          <Actor name="teste4" style={{ color: 'green' }}>
            <span>teste3</span>
          </Actor>
        </Scene>
      </div>
    )
  }
}
