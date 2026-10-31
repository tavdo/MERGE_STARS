import { Component, Suspense, useMemo, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { Center, OrbitControls, useGLTF } from '@react-three/drei'
function ObjectModel({url}: {url: string}) {
  const {scene} = useGLTF(url)
  const model = useMemo(() => scene.clone(true), [scene])
  return <Center><primitive object={model} /></Center>
}
class ModelBoundary extends Component<{children: ReactNode; unavailable: string}, {failed: boolean}> {
  state = {failed: false}
  static getDerivedStateFromError() { return {failed: true} }
  render() { return this.state.failed ? <p role="alert">{this.props.unavailable}</p> : this.props.children }
}
export default function MuseumModelViewer({url, unavailable}: {url: string; unavailable: string}) {
  return <ModelBoundary unavailable={unavailable}><div style={{height:460,maxHeight:'65vh'}}><Canvas camera={{position:[0,0,4],fov:42}} fallback={<p>{unavailable}</p>}><ambientLight intensity={1.3}/><directionalLight position={[4,6,3]} intensity={2}/><Suspense fallback={null}><ObjectModel url={url}/></Suspense><OrbitControls enablePan={false}/></Canvas></div></ModelBoundary>
}
