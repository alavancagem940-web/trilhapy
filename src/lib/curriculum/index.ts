import { nivelAvancado } from './avancado'
import { nivel1 } from './n1'
import { nivel2 } from './n2'
import { nivel3 } from './n3'
import { nivel4 } from './n4'
import type { Level } from '../lesson-core'

export const LEVELS: Level[] = [nivel1, nivel2, nivel3, nivel4, nivelAvancado]
