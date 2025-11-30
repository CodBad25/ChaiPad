// Plugin Panzoom - chargé uniquement côté client
import Panzoom from '@panzoom/panzoom'

// Exposer Panzoom globalement pour l'utiliser dans les composants
if (typeof window !== 'undefined') {
  window.Panzoom = Panzoom
}

export default (context, inject) => {
  inject('panzoom', Panzoom)
}
