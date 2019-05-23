import React from 'react'
import createReactClass from 'create-react-class'
/**
 * Responsável por importar o arquivo de configuração da minificação
 */
var minify = ''
try {
  minify = require('../../../death-star-minify.conf')
} catch (e) {
  console.error(
    'You need to create a configuration file for the library, please read the documentation at https://github.com/erickstryck/react-deathStar/blob/master/README.md'
  )
  minify = { minify: false }
}

minify = minify.minify
let instance = ''

class Storage {
  /**
   * Classe responsável por prover as funções da biblioteca.
   * @constructor
   *
   */
  constructor() {
    this.storage = {}
    this.htmlDict = []
  }

  /**
   * Inicia o storage
   *
   * @return {object}
   */
  static getInstance() {
    if (instance) {
      return instance
    } else {
      instance = new Storage()
      return instance
    }
  }

  /**
   * Apaga todos os dados do storage de elementos
   */
  static clearStorage() {
    Storage.getInstance().storage = {}
  }

  /**
   * Adiciona um item avulso no storage
   */
  static setItemStorage(key, value) {
    Storage.getInstance().storage[key] = value
  }

  /**
   * Recupera o dicionario html para o minify
   */
  static getHtmlDict() {
    return Storage.getInstance().htmlDict
  }

  /**
   * Seta um novo valor no dicionario html minify
   */
  static setHtmlDict(value) {
    Storage.getInstance().htmlDict.push(value)
  }

  /**
   * Persiste os dados informados no repositório local.
   * Poderá persistir o contexto do componente e recuperar o mesmo posteriormente.
   *
   * @param {string} key
   * @param {object} value
   * @param {boolean} context
   * @return {object | undefined}
   */
  static putStore(key, value, context) {
    if (context) {
      value['update'] = () => {
        value.setState({
          teatrumUpdater: value.teatrumUpdater ? true : false,
        })
      }
      let temp = {}
      Object.keys(value).map(current => {
        if (typeof value[current] === 'function') {
          temp[current] = value[current]
        }
      })
      temp['state'] = value.state
      Storage.getInstance().storage[key] = temp
    } else {
      Storage.getInstance().storage[key] = value
      return value
    }
  }

  /**
   * Recupera o dado do repositório por meio da 'Key' informada.
   *
   * @param {string} key
   * @return {object}
   */
  static getStore(key) {
    return Storage.getInstance().storage[key]
  }

  /**
   * Remove o objeto do repositório por meio da 'Key' informada.
   *
   * @param {string} key
   */
  static deleteStore(key) {
    delete Storage.getInstance().storage[key]
  }

  /**
   * Recupera todas as chaves realcionadas aos objetos persistidos no repositório.
   * @return {array}
   */
  static getKeys() {
    return Object.keys(Storage.getInstance().storage)
  }
}

const factory = key => {
  return createReactClass({
    getInitialState() {
      engine.processElement(
        React.createElement('div', this.props),
        key,
        false,
        this
      )
      return {
        staff: engine,
        key: key,
      }
    },

    render() {
      return this.state.staff.getElement(this.state.key)
    },
  })
}

const stage = props => {
  if (!props.name) {
    console.error("You need to enter the props 'name' for the component.")
    return null
  }

  return new (factory('stage_' + props.name))(props)
}

const scene = props => {
  if (!props.name) {
    console.error("You need to enter the props 'name' for the component.")
    return null
  }

  return new (factory('scene_' + props.name))(props)
}

const actor = props => {
  if (!props.name) {
    console.error("You need to enter the props 'name' for the component.")
    return null
  }

  return new (factory('actor_' + props.name))(props)
}

const engine = {
  /**
   * Recria o componente informado com seu devido mapeamento para manipulação.
   *
   * @param {string | object} type
   * @param {object} props
   * @param {object} children
   * @return {object}
   */
  builder(type, props, children) {
    if (children && children.length === 0) children = null
    props = props.children
      ? Object.assign({}, props, { children: null })
      : props
    props =
      Object.keys(props).indexOf('key') !== -1
        ? Object.assign({}, props, { key: props.key })
        : Object.assign({}, props, { key: this.getId() })
    return React.createElement(type, props, children)
  },

  /**
   * Limpa o repositório local de informações
   */
  clearBus() {
    Storage.clearStorage()
  },

  /**
   * Injeta uma instancia do react e inicia o storage
   *
   * @param {*} react
   */
  injectReact(react) {
    Store.getInstance(react)
  },

  /**
   * Insere o contexto do elemento para manipulação remota por outro componente.
   *
   * @param {string} key
   * @param {object} value
   */
  setContext(key, value) {
    Storage.putStore(key + '_context', value, true)
  },

  /**
   * Recupera o contexto do elemento para manipulação remota por outro componente.
   *
   * @param {string} key
   */
  getContext(key) {
    return Storage.getStore(key + '_context')
  },

  /**
   * Persiste os dados informados no repositório local.
   * Poderá persistir o contexto do componente e recuperar o mesmo posteriormente.
   *
   * @param {string} key
   * @param {object} value
   * @param {boolean} context
   * @return {object | undefined}
   */
  putStore(key, value, context) {
    return Storage.putStore(key, value, context)
  },

  /**
   * Recupera o dado do repositório por meio da 'Key' informada.
   *
   * @param {string} key
   * @return {object}
   */
  getStore(key) {
    return Storage.getStore(key)
  },

  /**
   * Remove o objeto do repositório por meio da 'Key' informada.
   *
   * @param {string} key
   */
  deleteStore(key) {
    Storage.deleteStore(key)
  },

  /**
   * Recupera todas as chaves realcionadas aos objetos persistidos no repositório.
   * @return {array}
   */
  keys() {
    return Storage.getKeys()
  },

  /**
   * Destrói os elementos React do repositório por meio da lista de Arrays informados.
   *
   * @param {array | string} keys
   */
  destroy(keys) {
    let store = engine.keys()
    if (keys instanceof Array) {
      keys.map(currentItem => {
        store.map(currentStore => {
          if (currentStore.split('-')[0] === currentItem) {
            Storage.deleteStore(currentItem)
          }
        })
      })
    } else {
      store.map(currentStore => {
        if (currentStore.split('-')[0] === keys) {
          Storage.deleteStore(currentStore)
        }
      })
    }
  },

  /**
   * Realiza a minificação dos tipos de objetos React fazendo a compressão de nomes dos componentes.
   *
   * @param {string} key
   * @return {string}
   */
  minf(key) {
    if (minify) {
      key.match(/(-\w[a-zA-Z]+)/g)
        ? key.match(/(-\w[a-zA-Z]+)/g).map(current => {
            if (
              Storage.getHtmlDict().indexOf(
                current.substring(1, key.length)
              ) === -1
            ) {
              key = key.replace(current.substring(1, key.length), 't')
            }
          })
        : ''
    }
    return key
  },

  /**
   * Prepara um container de informações para serem criadas e indexadas.
   *
   * @param {object} data
   * @param {boolean} copy
   * @return {object}
   */
  container(data, copy = false) {
    let newProps = data.props
    if (Object.keys(data).indexOf('key') !== -1 && data['key'] && !copy)
      newProps = Object.assign({}, newProps, { key: data.key })
    if (Object.keys(data).indexOf('ref') !== -1 && data['ref'])
      newProps = Object.assign({}, newProps, { ref: data.ref })
    return engine.builder(
      data.type,
      newProps ? newProps : null,
      Object.keys(data.props).indexOf('children') !== -1
        ? engine.processChildren(data.props.children, copy)
        : []
    )
  },

  /**
   * Processa os filhos de um elemento React para que possam ser mapeados para manipulação.
   *
   * @param {object | array} children
   * @param {boolean} copy
   * @return {object}
   */
  processChildren(children, copy) {
    return children
      ? children instanceof Array
        ? children.length > 0
          ? children.map(function(arrChild) {
              if (arrChild)
                return arrChild.type
                  ? engine.container(arrChild, copy)
                  : arrChild
            })
          : null
        : children.type
        ? engine.container(children, copy)
        : children
      : null
  },

  /**
   * Processa um elemento React para que possam ser mapeado para manipulação.
   *
   * @param {object} data
   * @param {string} key
   * @param {boolean} copy
   * @return {object}
   */
  processElement(data, key, copy = false, context) {
    let obj = engine.setStore(key, data, copy)
    engine.mapChildrens(obj.props.children, key)
    if (context) {
      engine.setContext(key, context)
    }

    return data
  },

  /**
   * Dispara o update quando uma ação é feita nos componentes
   */
  propagateUpdates(key) {
    let context = engine.getContext(key.split('-')[0])
    context.update()
  },

  /**
   * Mapeia os filhos processados de um elemento para indexação no repositório.
   *
   * @param {object} data
   * @param {string} key
   */
  mapChildrens(data, key) {
    if (data) {
      if (data instanceof Array) {
        data.map(function(current, index) {
          if (current) {
            ++index
            if (current.props)
              engine.mapChildrens(
                current.props.children,
                key + '-' + engine.haveTypeName(current.type) + index
              )
            if (current.props)
              engine.putStore(
                key + '-' + engine.haveTypeName(current.type) + index,
                current.key
              )
          }
        })
      } else {
        if (data.props)
          engine.mapChildrens(
            data.props.children,
            key + '-' + engine.haveTypeName(data.type) + '1'
          )
        if (data.props)
          engine.putStore(
            key + '-' + engine.haveTypeName(data.type) + '1',
            data.key
          )
      }
    }
  },

  /**
   * Verifica se o tipo do componente já foi inserido no dicionário de tipos, caso não exista ele o insere.
   *
   * @param {string} type
   * @return {string}
   */
  haveTypeName(type) {
    if (minify && typeof type === 'string') {
      if (Storage.getHtmlDict().indexOf(type) === -1) Storage.setHtmlDict(type)
    }
    return type.displayName ? type.displayName : type.name ? type.name : type
  },

  /**
   * Recupera um ID único para uso no mapeamento de elementos.
   * @return {string}
   */
  getId() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1)
    }
    return (
      s4() +
      s4() +
      '_' +
      s4() +
      '_' +
      s4() +
      '_' +
      s4() +
      '_' +
      s4() +
      s4() +
      s4()
    )
  },

  /**
   * Insere no repositório um elemento react novo
   *
   * @param {string} key
   * @param {object} jsxData
   * @param {boolean} copy
   * @return {object}
   */
  setStore(key, jsxData, copy = false) {
    return engine.putStore(key, engine.container(jsxData, copy))
  },

  /**
   * Recupera um elemento do repositório para renderização.
   *
   * @param {string} key
   * @return {object}
   */
  getElement(key) {
    key = engine.minf(key)
    if (engine.checkKey(key)) {
      let temp = engine.getStore(key)
      let keyMaster = temp.props ? temp.key : temp
      let keyArr = key.split('-')
      if (engine.checkKey(keyArr[0])) {
        let obj = engine.getStore(keyArr[0])
        return obj.key === keyMaster
          ? obj
          : engine.walkChildren(obj.props.children, keyMaster)
      }
    }
  },

  /**
   * Insere o novo objeto de propriedades ao elemento substituindo as antigas propriedades, o elemento será encontrado pela chave informada.
   *
   * @param {string} key
   * @param {object} props
   */
  setProps(key, props) {
    if (!key && !(props instanceof Object)) {
      console.log(
        'metodo: setProps - Você precisa especificar uma key em string e um props no formato objeto!'
      )
      return
    }
    if (engine.checkKey(key)) {
      let tempJsx = engine.getElement(key)
      if (Object.keys(props).indexOf('ref') !== -1) {
        tempJsx = Object.assign({}, tempJsx, { ref: props.ref })
        delete props.ref
      }
      tempJsx = engine.swapPropsAttr(tempJsx, props)
      engine.updateAllReferences(tempJsx)
    }
  },

  /**
   * Retorna todos os filhos de um elemento recursivamente.
   *
   * @param {object} data
   * @param {string} key
   * @return {array}
   */
  walkChildren(data, key) {
    let walk = ''
    if (data) {
      if (data instanceof Array) {
        for (let x = 0; x < data.length; x++) {
          if (data[x]) {
            if (data[x].key === key) return data[x]
            else if (data[x].props)
              walk = engine.walkChildren(data[x].props.children, key)
            if (walk && walk.key === key) return walk
          }
        }
      } else {
        if (data.key === key) return data
        else if (data.props)
          walk = engine.walkChildren(data.props.children, key)
        if (walk && walk.key === key) return walk
      }
    }
    return
  },

  /**
   * Recupera o elemento por meio de sua chave e realiza uma cópia aplicando a ela uma nova chave.
   *
   * @param {string} key
   * @param {string} newKey
   * @return {object | undefined}
   */
  copy(key, newKey, target) {
    let element =
      engine.checkKey(key) && engine.checkKey(target)
        ? engine.processElement(
            engine.getElement(key),
            newKey,
            true,
            engine.getContext(target)
          )
        : ''

    if (element) engine.setChildren(target, element)
    return element
  },

  /**
   * Insere um novo atributo no objeto relacionado a chave informada.
   *
   * @param {string} key
   * @param {object} attributes
   */
  setAttribute(key, attributes) {
    if ((!key && !attributes) || !(attributes instanceof Object)) {
      console.log(
        'metodo: setAttributes - Você precisa especificar uma key em string e um atributo no formato objeto!'
      )
      return
    }
    if (engine.checkKey(key)) {
      if (attributes.ref) {
        let tempJsx = engine.getElement(key)
        let updated = Object.assign({}, tempJsx, attributes)
        engine.updateAllReferences(updated)
      } else {
        if (engine.checkProps(key)) {
          let tempJsx = engine.getElement(key)
          let updated = engine.swapPropsAttr(tempJsx, attributes)
          engine.updateAllReferences(updated)
        }
      }
    }
  },

  /**
   * Reaplica um novo valor ao atributo passado ao objeto por meio da chave informada.
   *
   * @param {string} key
   * @param {object} attValues
   */
  modifyAttribute(key, attValues) {
    Object.keys(attValues).map(current => {
      engine.processModify(key, current, attValues[current])
    })
  },

  /**
   * Aplica as mudanças nos atributos de acordo com os valores informados.
   *
   * @param {string} key
   * @param {string} atrName
   * @param {object} value
   */
  processModify(key, atrName, value) {
    if (!key && !atrName && !value) {
      console.log(
        'metodo: modifyAttribute - Você precisa especificar a key, o nome do atributo e seu valor por parâmetro!'
      )
      return
    }
    if (engine.checkKey(key)) {
      if (engine.checkProps(key)) {
        if (engine.checkAttribute(key, atrName) || atrName === 'ref') {
          let tempJsx = engine.getElement(key)
          if (atrName === 'ref') {
            let updated = Object.assign({}, tempJsx, { ref: value })
            engine.updateAllReferences(updated)
          } else {
            let tempVar = {}
            tempVar[atrName] = value
            let updated = engine.swapPropsAttr(tempJsx, tempVar)
            engine.updateAllReferences(updated)
          }
        }
      }
    }
  },

  /**
   * Recupera o elemento do repositório e realiza a remoção dos atributos informados.
   *
   * @param {string} key
   * @param {array | string} attValues
   */
  removeAttribute(key, attValues) {
    if (attValues instanceof Array) {
      attValues.map(current => {
        engine.processRemove(key, current)
      })
    } else {
      engine.processRemove(key, attValues)
    }
  },

  /**
   * Aplica a remoção dos atributos de acordo com os valores informados.
   *
   * @param {string} key
   * @param {string} atrName
   */
  processRemove(key, atrName) {
    if (!key && !atrName) {
      console.log(
        'metodo: removeAttribute - Você precisa especificar uma key em string e o nome do atributo a ser removido!'
      )
      return
    }
    if (engine.checkKey(key)) {
      if (engine.checkProps(key)) {
        let tempJsx = engine.getElement(key)
        if (atrName === 'ref') {
          let updated = Object.assign({}, tempJsx, { ref: null })
          engine.updateAllReferences(updated)
        }
        if (engine.checkAttribute(key, atrName)) {
          let index = Object.keys(tempJsx.props)
          index.splice(index.indexOf(atrName), 1)
          let tempObj = {}
          index.map(current => {
            tempObj[current] = tempJsx.props[current]
          })
          let result = Object.assign({}, tempJsx, { props: tempObj })
          engine.updateAllReferences(result)
        }
      }
    }
  },

  /**
   * Realiza a inserção de um elemento filho em um outro elemento especificado pela chave,
   * poderá ser informado o índice onde será inserido o objeto, caso a flag "mergeIndex" for informada o conteúdo será mergeado na fila sem nenhuma
   * remoção dos itens existentes. A fila de elementos será empurrada para acomodar o novo elemento no indice informado.
   *
   * @param {string} key
   * @param {object} childrenVal
   * @param {Number} index
   * @param {boolean} mergeIndex
   */
  setChildren(key, childrenVal, index = '', mergeIndex = false) {
    if (!key && !childrenVal) {
      console.log(
        'metodo: setChildren - Você precisa especificar a key e um elemento a ser inserido!'
      )
      return
    }
    if (engine.checkKey(key)) {
      let tempJsx = engine.getElement(key)
      if (engine.checkProps(key)) {
        if (tempJsx.props.children) {
          let arrChild = ''
          if (childrenVal instanceof Array) {
            arrChild = tempJsx.props.children
            if (!(arrChild instanceof Array)) arrChild = new Array(arrChild)
            let updated = {}
            if (index) {
              index--
              if (mergeIndex) arrChild.splice(index, 0, ...childrenVal)
              else arrChild.splice(index, 1, ...childrenVal)
              updated = engine.swapPropsAttr(tempJsx, { children: arrChild })
            } else
              updated = engine.swapPropsAttr(tempJsx, {
                children: arrChild.concat(childrenVal),
              })
            engine.updateAllReferences(updated)
          } else {
            arrChild =
              tempJsx.props.children instanceof Array
                ? tempJsx.props.children
                : new Array(tempJsx.props.children)
            if (index) {
              index--
              if (mergeIndex) arrChild.splice(index, 0, childrenVal)
              else arrChild[index] = childrenVal
            } else {
              arrChild.push(childrenVal)
            }
            let updated = engine.swapPropsAttr(tempJsx, { children: arrChild })
            engine.updateAllReferences(updated)
          }
        } else {
          let updated = engine.swapPropsAttr(tempJsx, { children: childrenVal })
          engine.updateAllReferences(updated)
        }
      }
    }
  },

  /**
   * Recupera um elemento pela chave e realiza a remoção do filho especificado pelo índice informado
   * o índice obedece a regra da ordem dos filhos do elemento pai.
   *
   * @param {string} key
   * @param {intger} index
   */
  removeChildren(key, index) {
    if (index instanceof Array && index !== -1) {
      index.map(current => {
        engine.processRemoveChildren(key, current)
      })
    } else if (index === -1) {
      engine.processResetChildren(key)
    } else engine.processRemoveChildren(key, index)
  },

  /**
   * Aplica a remoção do filho de acordo com os valores informados.
   *
   * @param {string} key
   * @param {Number} index
   */
  processRemoveChildren(key, index) {
    index--
    if (!key && index) {
      console.log(
        'metodo: removeChildren - Você precisa especificar a key onde será retirada a children e o índice que corresponde a children a ser removida!'
      )
      return
    }
    if (engine.checkKey(key)) {
      let jsxMaster = engine.getElement(key)
      if (jsxMaster.props.children instanceof Array) {
        let newArr = jsxMaster.props.children.filter(
          (current, idx) => index !== idx
        )
        let updated = engine.swapPropsAttr(jsxMaster, { children: newArr })
        engine.updateAllReferences(updated)
      } else {
        let updated = engine.swapPropsAttr(jsxMaster, { children: null })
        engine.updateAllReferences(updated)
      }
    } else console.log('Chave não encontrada!')
  },

  /**
   * Remove todos os filhos de um elemento recuperado pela chave.
   *
   * @param {string} key
   */
  processResetChildren(key) {
    if (!key) {
      console.log(
        'metodo: removeChildren - Você precisa especificar a key onde será retirada os childrens !'
      )
      return
    }
    if (engine.checkKey(key)) {
      let jsxMaster = engine.getElement(key)
      let updated = engine.swapPropsAttr(jsxMaster, { children: null })
      engine.updateAllReferences(updated)
    } else console.log('Chave não encontrada!')
  },

  /**
   * Realiza a atualização das mudanças em todo os elementos do repositório.
   *
   * @param {object} obj
   */
  updateAllReferences(obj) {
    let keys = engine.keys()
    keys.map(function(current) {
      let tempElement = engine.getStore(current)
      if (tempElement.props) {
        if (tempElement.key !== obj.key) {
          let childrenUpdated = engine.checkChildrensInArray(obj, tempElement)
          engine.processElement(
            engine.swapPropsAttr(tempElement, {
              children: childrenUpdated,
            }),
            current
          )
          engine.putStore(current, engine.getElement(current))
        } else {
          engine.processElement(obj, current)
          engine.putStore(current, engine.getElement(current))
        }
      }
    })
  },

  /**
   * Verifica e aplica as mudanças nos filhos de um elemento pai.
   *
   * @param {object} mainElement
   * @param {object} currentElement
   * @return {object}
   */
  checkChildrensInArray(mainElement, currentElement) {
    if (currentElement && currentElement.props) {
      let childrens = currentElement.props.children
      let childrenUpdated = []
      if (childrens && childrens instanceof Array) {
        childrens.map(function(current) {
          let nextChildrens = engine.checkChildrensInArray(mainElement, current)
          childrenUpdated = engine.compareChildrens(
            mainElement,
            current,
            childrenUpdated,
            nextChildrens
          )
        })
        return childrenUpdated
      } else if (childrens && childrens.props) {
        let nextChildrens = engine.checkChildrensInArray(mainElement, childrens)
        childrenUpdated = engine.compareChildrens(
          mainElement,
          childrens,
          childrenUpdated,
          nextChildrens
        )
        return childrenUpdated
      } else return childrens
    } else return currentElement
  },

  /**
   * Verifica se houve alteração no filho encontrado e recupera o filho atualizado.
   *
   * @param {object} mainElement
   * @param {object} current
   * @param {object} childrenUpdated
   * @param {object} nextChildrens
   * @return {object}
   */
  compareChildrens(mainElement, current, childrenUpdated, nextChildrens) {
    if (current && current.key && current.key === mainElement.key) {
      childrenUpdated.push(mainElement)
    } else {
      if (current && current.props)
        childrenUpdated.push(
          engine.swapPropsAttr(current, { children: nextChildrens })
        )
      else childrenUpdated.push(current)
    }
    return childrenUpdated
  },

  /**
   * Realiza a inserção de novos atributos a um elemento informado.
   *
   * @param {object} obj
   * @param {object} newAttr
   * @return {object}
   */
  swapPropsAttr(obj, newAttr) {
    let tempProps = Object.assign({}, obj.props, newAttr)
    return Object.assign({}, obj, { props: tempProps })
  },

  /**
   * Verifica se existe algum item no repositório relacionado a chave informada.
   *
   * @param {string} key
   * @return {boolean}
   */
  checkKey(key) {
    let hasKey = engine.keys().indexOf(key) === -1 ? false : true

    if (!hasKey) {
      console.error(
        `this key "${key}" was not found, see the available keys: ${engine.keys()}`
      )
    }
    return hasKey
  },

  /**
   * Verifica se o elemento relacionado a chave informada contém propriedades.
   *
   * @param {string} key
   * @return {boolean}
   */
  checkProps(key) {
    return engine.checkKey(key)
      ? Object.keys(engine.getElement(key)).indexOf('props') === -1
        ? false
        : true
      : false
  },

  /**
   * Verifica se o elemento relacionado a chave informada contém o atributo indicado.
   *
   * @param {string} key
   * @param {string} atrName
   * @return {boolean}
   */
  checkAttribute(key, atrName) {
    return engine.checkKey(key)
      ? engine.checkProps(key)
        ? Object.keys(engine.getElement(key).props).indexOf(atrName) === -1
          ? false
          : true
        : false
      : false
  },
}

const bridge = {
  getElement(key) {
    return engine.getElement(key)
  },

  copy(key, newKey, target, preventUpdate = false) {
    if (!key || !newKey || !target) {
      console.error(
        'For cloning you must enter:an existing key, a new key, a target key where the new element will be inserted'
      )
      return
    }
    if (key == target) {
      console.error('The target key can not be the same key to be cloned')
      return
    }

    let element = engine.copy(key, newKey, target)

    if (!preventUpdate) engine.propagateUpdates(key)
    return element
  },

  keys() {
    return engine.keys()
  },

  setAttribute(key, attributes, preventUpdate = false) {
    engine.setAttribute(key, attributes)
    if (!preventUpdate) engine.propagateUpdates(key)
  },

  setProps(key, props, preventUpdate = false) {
    engine.setProps(key, props)
    if (!preventUpdate) engine.propagateUpdates(key)
  },

  modifyAttribute(key, value, preventUpdate = false) {
    engine.modifyAttribute(key, value)
    if (!preventUpdate) engine.propagateUpdates(key)
  },

  removeAttribute(key, atrName, preventUpdate = false) {
    engine.removeAttribute(key, atrName)
    if (!preventUpdate) engine.propagateUpdates(key)
  },

  setChildren(
    key,
    children,
    index = '',
    mergeIndex = false,
    preventUpdate = false
  ) {
    engine.setChildren(key, children, index, mergeIndex)
    if (!preventUpdate) engine.propagateUpdates(key)
  },

  removeChildren(key, index, preventUpdate = false) {
    engine.removeChildren(key, index)
    if (!preventUpdate) engine.propagateUpdates(key)
  },

  checkAttribute(key, atrName, preventUpdate = false) {
    return engine.checkAttribute(key, atrName)
  },

  destroy(keys) {
    engine.destroy(keys)
  },
}

export const Staff = bridge
export const Stage = stage
export const Scene = scene
export const Actor = actor