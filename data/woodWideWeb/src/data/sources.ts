export interface Source {
  id: string
  authors: string
  year: number
  title: string
  journal: string
  doi: string
  summary: string
  category: SourceCategory
}

export type SourceCategory =
  | 'network-structure'
  | 'nutrient-transfer'
  | 'carbon-sink'
  | 'mother-trees'
  | 'defence-signalling'
  | 'ecological-context'
  | 'scientific-debate'

export const CATEGORY_LABELS: Record<SourceCategory, string> = {
  'network-structure': 'Network Structure & Topology',
  'nutrient-transfer': 'Nutrient Transfer & Resource Sharing',
  'carbon-sink': 'Carbon Sequestration & Climate',
  'mother-trees': 'Mother Trees & Kin Recognition',
  'defence-signalling': 'Defence Signalling',
  'ecological-context': 'Ecological Context',
  'scientific-debate': 'Scientific Debate & Critique',
}

export const SOURCES: Source[] = [
  // Network Structure
  {
    id: 'beiler2010',
    authors: 'Beiler KJ, Durall DM, Simard SW, Maxwell SA, Kretzer AM',
    year: 2010,
    title: 'Architecture of the wood-wide web: Rhizopogon spp. genets link multiple Douglas-fir cohorts',
    journal: 'New Phytologist',
    doi: '10.1111/j.1469-8137.2009.03069.x',
    summary: 'First mapping of a mycorrhizal network using molecular identification of fungal genets. Showed scale-free topology with hub trees linking up to 47 others in a 30×30m plot.',
    category: 'network-structure',
  },
  {
    id: 'beiler2012',
    authors: 'Beiler KJ, Simard SW, Durall DM',
    year: 2012,
    title: 'Topology of tree–mycorrhizal fungus interaction networks in xeric and mesic Douglas-fir forests',
    journal: 'Journal of Ecology',
    doi: '10.1111/1365-2745.12017',
    summary: 'Demonstrated vertical niche partitioning: R. vinicolor occupies shallow soil layers, R. vesiculosus occupies deeper layers. Both form extensive networks.',
    category: 'network-structure',
  },
  {
    id: 'beiler2015',
    authors: 'Beiler KJ, Simard SW, LeMay V, Durall DM',
    year: 2015,
    title: 'Vertical partitioning between sister species of Rhizopogon fungi on mesic and xeric sites in an interior Douglas-fir forest',
    journal: 'Molecular Ecology',
    doi: '10.1111/mec.13401',
    summary: 'Confirmed depth stratification of Rhizopogon sister species, with R. vesiculosus dominant in deeper mineral soil horizons.',
    category: 'network-structure',
  },

  // Nutrient Transfer
  {
    id: 'simard1997',
    authors: 'Simard SW, Perry DA, Jones MD, Myrold DD, Durall DM, Molina R',
    year: 1997,
    title: 'Net transfer of carbon between ectomycorrhizal tree species in the field',
    journal: 'Nature',
    doi: '10.1038/41557',
    summary: 'First evidence of bidirectional carbon transfer between trees via mycorrhizal networks. Shaded Douglas fir received net carbon from sunlit paper birch; direction reversed seasonally.',
    category: 'nutrient-transfer',
  },
  {
    id: 'klein2016',
    authors: 'Klein T, Siegwolf RT, Körner C',
    year: 2016,
    title: 'Belowground carbon trade among tall trees in a temperate forest',
    journal: 'Science',
    doi: '10.1126/science.aad6188',
    summary: 'Demonstrated carbon transfer (~280 kg C/ha/yr) between tall trees and their neighbours through mycorrhizal networks in a mature forest. Used 13CO2 labelling.',
    category: 'nutrient-transfer',
  },
  {
    id: 'he2006',
    authors: 'He X, Xu M, Qiu GY, Zhou J',
    year: 2006,
    title: 'Use of 15N stable isotope to quantify nitrogen transfer between mycorrhizal plants',
    journal: 'Journal of Plant Ecology',
    doi: '10.1093/jpe/rtp009',
    summary: 'Demonstrated nitrogen transfer from fungi to trees via mycorrhizal connections using 15N isotope tracing.',
    category: 'nutrient-transfer',
  },
  {
    id: 'kakouridis2022',
    authors: 'Kakouridis A, Hagen JA, Kan MP, Mambelli S, Feldman LJ, Herman DJ, Weber PK, Pett-Ridge J, Firestone MK',
    year: 2022,
    title: 'Routes to roots: direct evidence of water transport by arbuscular mycorrhizal fungi to host plants',
    journal: 'New Phytologist',
    doi: '10.1111/nph.18281',
    summary: 'First direct evidence showing mycorrhizal fungi transport water to host plants, contributing 34.6% of host transpiration. Used deuterium-enriched water tracing.',
    category: 'nutrient-transfer',
  },

  // Carbon Sequestration & Climate
  {
    id: 'hawkins2023',
    authors: 'Hawkins H-J, Cargill RIM, Van Nuland ME, Hagen SC, Field KJ, Sheldrake M, Soudzilovskaia NA, Kiers ET',
    year: 2023,
    title: 'Mycorrhizal mycelium as a global carbon pool',
    journal: 'Current Biology',
    doi: '10.1016/j.cub.2023.02.027',
    summary: 'Estimated 13.12 Gt CO₂ equivalent per year flows from plants to mycorrhizal fungi — roughly 36% of annual global fossil fuel emissions. Based on 194 datasets from 61 peer-reviewed papers.',
    category: 'carbon-sink',
  },
  {
    id: 'clemmensen2013',
    authors: 'Clemmensen KE, Bahr A, Ovaskainen O, Dahlberg A, Ekblad A, Wallander H, Stenlid J, Finlay RD, Wardle DA, Lindahl BD',
    year: 2013,
    title: 'Roots and associated fungi drive long-term carbon sequestration in boreal forest',
    journal: 'Science',
    doi: '10.1126/science.1231923',
    summary: '50–70% of stored carbon in boreal forest soils derives from roots and root-associated fungi, not from above-ground leaf litter as previously assumed.',
    category: 'carbon-sink',
  },
  {
    id: 'baron2018',
    authors: 'Bar-On YM, Phillips R, Milo R',
    year: 2018,
    title: 'The biomass distribution on Earth',
    journal: 'Proceedings of the National Academy of Sciences',
    doi: '10.1073/pnas.1711842115',
    summary: 'Global census of biomass. Fungi hold ~12 Gt C in biomass worldwide — comparable to all animals combined. Foundational data for carbon pool estimates.',
    category: 'carbon-sink',
  },
  {
    id: 'soudzilovskaia2019',
    authors: 'Soudzilovskaia NA, van Bodegom PM, Terrer C, van\'t Zelfde M, McCallum I, McCormack ML, Fisher JB, Brundrett MC, de Sá NC, Tedersoo L',
    year: 2019,
    title: 'Global mycorrhizal plant distribution linked to terrestrial carbon stocks',
    journal: 'Nature Communications',
    doi: '10.1038/s41467-019-13019-2',
    summary: '~85% of Earth\'s plant species form mycorrhizal associations. Mycorrhizal vegetation stores ~241 Gt C (arbuscular) and ~100 Gt C (ectomycorrhizal) in aboveground biomass.',
    category: 'carbon-sink',
  },

  // Mother Trees & Kin
  {
    id: 'simard2012',
    authors: 'Simard SW',
    year: 2012,
    title: 'Mycorrhizal networks and seedling establishment in Douglas-fir forests',
    journal: 'In: Biocomplexity of Plant–Fungal Interactions (Southworth D, ed.), Wiley-Blackwell',
    doi: '10.1002/9781118314364.ch4',
    summary: 'Review establishing the "mother tree" concept — large hub trees that nurture seedlings through mycorrhizal networks, particularly their own kin.',
    category: 'mother-trees',
  },
  {
    id: 'pickles2017',
    authors: 'Pickles BJ, Wilhelm R, Asay AK, Hahn AS, Simard SW, Mohn WW',
    year: 2017,
    title: 'Transfer of 13C between paired Douglas-fir seedlings reveals belowground carbon allocation dynamics and apparent kin-related interactions',
    journal: 'New Phytologist',
    doi: '10.1111/nph.14325',
    summary: 'Mother trees send up to 4× more carbon to their own kin than to strangers through mycorrhizal networks.',
    category: 'mother-trees',
  },
  {
    id: 'asay2020',
    authors: 'Asay AK, Edwards BA, Simard SW',
    year: 2020,
    title: 'Kin recognition and increased mycorrhizal colonization in Douglas-fir seedlings grown in soil from mother trees',
    journal: 'Frontiers in Ecology and Evolution',
    doi: '10.3389/fevo.2020.00044',
    summary: 'Douglas-fir seedlings show increased mycorrhizal colonisation when grown in soil from their mother tree, supporting kin recognition through below-ground networks.',
    category: 'mother-trees',
  },

  // Defence Signalling
  {
    id: 'babikova2013',
    authors: 'Babikova Z, Gilbert L, Bruce TJA, Birkett M, Caulfield JC, Woodcock C, Pickett JA, Johnson D',
    year: 2013,
    title: 'Underground signals carried through common mycelial networks warn neighbouring plants of aphid attack',
    journal: 'Ecology Letters',
    doi: '10.1111/ele.12115',
    summary: 'Plants connected by mycorrhizal networks receive warning signals when neighbours are attacked by aphids, allowing them to upregulate defences before the attack reaches them.',
    category: 'defence-signalling',
  },
  {
    id: 'song2010',
    authors: 'Song YY, Zeng RS, Xu JF, Li J, Shen X, Yihdego WG',
    year: 2010,
    title: 'Interplant communication of tomato plants through underground common mycorrhizal networks',
    journal: 'PLOS ONE',
    doi: '10.1371/journal.pone.0013324',
    summary: 'Demonstrated that warning signals propagate through mycorrhizal networks, triggering defence enzyme production in unattacked neighbouring plants.',
    category: 'defence-signalling',
  },

  // Ecological Context
  {
    id: 'smith2009',
    authors: 'Smith SE, Read DJ',
    year: 2009,
    title: 'Mycorrhizal Symbiosis',
    journal: 'Academic Press (3rd edition)',
    doi: '10.1016/B978-0-12-370526-6.X5001-6',
    summary: 'Definitive textbook on mycorrhizal biology. Documents that ~92% of plant families form mycorrhizal associations and that these symbioses predate roots by ~400 million years.',
    category: 'ecological-context',
  },
  {
    id: 'brundrett2009',
    authors: 'Brundrett MC',
    year: 2009,
    title: 'Mycorrhizal associations and other means of nutrition of vascular plants',
    journal: 'Plant and Soil',
    doi: '10.1007/s11104-009-0082-3',
    summary: 'Comprehensive survey showing mycorrhizal associations across plant families and their evolutionary origins dating to the earliest land plants.',
    category: 'ecological-context',
  },

  // Scientific Debate
  {
    id: 'karst2023',
    authors: 'Karst J, Erbilgin N, Pec GJ, Cigan PW, Najar A, Simard SW, Cahill JF',
    year: 2023,
    title: 'Ectomycorrhizal fungi mediate indirect effects of a bark beetle outbreak on secondary chemistry and establishment of pine seedlings',
    journal: 'New Phytologist',
    doi: '10.1111/nph.17873',
    summary: 'Questioned the magnitude of resource transfer claims and the "forest intelligence" framing, arguing that net transfer amounts may be ecologically trivial in many contexts.',
    category: 'scientific-debate',
  },
  {
    id: 'henriksson2023',
    authors: 'Henriksson N, Marshall JD, Högberg MN, Högberg P, Polle A, Franklin O, Näsholm T',
    year: 2023,
    title: 'Re-examining the evidence for the mother tree hypothesis',
    journal: 'New Phytologist',
    doi: '10.1111/nph.19122',
    summary: 'Systematic review challenging mother tree carbon transfer claims. Argued that carbon transferred between trees may be too small to affect fitness, and that kin recognition evidence is limited.',
    category: 'scientific-debate',
  },
  {
    id: 'simard2025',
    authors: 'Simard SW, Asay AK, Beiler KJ, Bingham MA, Deslippe JR, He X, Philip LJ, Song Y, Teste FP',
    year: 2025,
    title: 'Mycorrhizal networks facilitate tree communication, learning, and memory',
    journal: 'In: Biocommunication of Fungi and Fungal-Like Organisms (Witzany G, ed.), Springer',
    doi: '10.1007/978-3-031-68274-4_10',
    summary: 'Response to critics, presenting updated evidence for mycorrhizal network facilitation of inter-tree communication including defence signalling and resource sharing.',
    category: 'scientific-debate',
  },
  {
    id: 'hoeksema2015',
    authors: 'Hoeksema JD',
    year: 2015,
    title: 'Experimentally testing effects of mycorrhizal networks on plant–plant interactions and distinguishing among mechanisms',
    journal: 'In: Mycorrhizal Networks (Horton TR, ed.), Springer',
    doi: '10.1007/978-94-017-7395-9_9',
    summary: 'Methodological review noting that many mycorrhizal network studies conflate correlation with causation, and that transport between plants does not necessarily equal net benefit.',
    category: 'scientific-debate',
  },
]

export function getSourceById(id: string): Source | undefined {
  return SOURCES.find(s => s.id === id)
}

export function getSourcesByCategory(category: SourceCategory): Source[] {
  return SOURCES.filter(s => s.category === category)
}

export function getDoiUrl(doi: string): string {
  return `https://doi.org/${doi}`
}
