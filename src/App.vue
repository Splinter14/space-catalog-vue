<script setup>
import { computed, onMounted, ref } from 'vue'
import SiteHeader from '@/components/SiteHeader.vue'
import ProductCard from '@/components/ProductCard.vue'
import { resolveAsset } from '@/utils/formatters'

const products = ref([])
const isLoading = ref(true)
const loadError = ref('')

const searchQuery = ref('')
const selectedCategory = ref('Усі')
const sortBy = ref('default')

const categories = computed(() => {
  const counts = new Map()
  for (const item of products.value) {
    counts.set(item.category, (counts.get(item.category) || 0) + 1)
  }

  return [
    { name: 'Усі', count: products.value.length },
    ...Array.from(counts.entries()).map(([name, count]) => ({ name, count })),
  ]
})

const filteredProducts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  const list = products.value.filter((product) => {
    const matchesCategory =
      selectedCategory.value === 'Усі' || product.category === selectedCategory.value
    const matchesSearch = !query || product.name.toLowerCase().includes(query)
    return matchesCategory && matchesSearch
  })

  if (sortBy.value === 'price-asc') {
    return [...list].sort((a, b) => a.price - b.price)
  }
  if (sortBy.value === 'price-desc') {
    return [...list].sort((a, b) => b.price - a.price)
  }

  return list
})

function resetFilters() {
  searchQuery.value = ''
  selectedCategory.value = 'Усі'
  sortBy.value = 'default'
}

async function loadCatalog() {
  isLoading.value = true
  loadError.value = ''

  try {
    const response = await fetch(resolveAsset('data/catalog.json'))
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    products.value = await response.json()
  } catch (error) {
    loadError.value = 'Не вдалося завантажити каталог товарів. Спробуйте оновити сторінку.'
    console.error('Catalog fetch error:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadCatalog)
</script>

<template>
  <SiteHeader :total-count="0" :total-price="0" />

  <main class="container shop-main">
    <section class="hero-banner">
      <div class="hero-text">
        <span class="hero-kicker">Космічний каталог · Vue 3</span>
        <h1>Космічні постери, 3D-моделі та сувеніри</h1>
        <p>
          Продовження проєкту «КосмоСвіт»: обирайте постери далеких галактик, деталізовані
          3D-моделі планет і ракет та подарункові сувеніри з миттєвим оновленням кошика.
        </p>
      </div>
      <div class="hero-image">
        <img :src="resolveAsset('images/hero.jpg')" alt="Вид на нічну Землю з космосу" />
      </div>
    </section>

    <section class="controls-panel" aria-label="Пошук та фільтрація каталогу">
      <div class="controls-top">
        <div class="search-box">
          <input
            v-model.trim="searchQuery"
            type="search"
            class="search-input"
            placeholder="Пошук за назвою (наприклад: Марс, Сатурн, постер)..."
            aria-label="Пошук товару за назвою"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="search-clear-btn"
            aria-label="Очистити пошук"
            @click="searchQuery = ''"
          >
            ✕
          </button>
        </div>

        <select v-model="sortBy" class="sort-select" aria-label="Сортування за ціною">
          <option value="default">За замовчуванням</option>
          <option value="price-asc">Ціна: спочатку дешевші</option>
          <option value="price-desc">Ціна: спочатку дорожчі</option>
        </select>
      </div>

      <div class="controls-bottom">
        <div class="category-pills" role="tablist" aria-label="Фільтр за категорією">
          <button
            v-for="cat in categories"
            :key="cat.name"
            type="button"
            class="category-pill"
            :class="{ active: selectedCategory === cat.name }"
            @click="selectedCategory = cat.name"
          >
            {{ cat.name }} ({{ cat.count }})
          </button>
        </div>

        <span v-if="!isLoading && !loadError" class="results-meta">
          Знайдено: {{ filteredProducts.length }} з {{ products.length }}
        </span>
      </div>
    </section>

    <div v-if="isLoading" class="empty-state">
      <div class="empty-icon">🛰️</div>
      <h3>Завантажуємо каталог...</h3>
      <p>Отримуємо дані про космічні товари з JSON-каталогу.</p>
    </div>

    <div v-else-if="loadError" class="empty-state">
      <div class="empty-icon">⚠️</div>
      <h3>Помилка завантаження</h3>
      <p>{{ loadError }}</p>
      <button type="button" class="btn" @click="loadCatalog">Спробувати ще раз</button>
    </div>

    <div v-else-if="filteredProducts.length === 0" class="empty-state">
      <div class="empty-icon">🔭</div>
      <h3>Нічого не знайдено</h3>
      <p>
        За запитом
        <strong v-if="searchQuery">«{{ searchQuery }}»</strong>
        <span v-if="searchQuery && selectedCategory !== 'Усі'"> у категорії </span>
        <strong v-if="selectedCategory !== 'Усі'">«{{ selectedCategory }}»</strong>
        товарів не знайдено. Спробуйте змінити умови пошуку.
      </p>
      <button type="button" class="btn" @click="resetFilters">Скинути фільтри</button>
    </div>

    <section v-else class="catalog-grid">
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
      />
    </section>
  </main>

  <footer>
    <div class="container">
      <p>© 2026 КосмоСвіт Store. Комп'ютерний практикум № 2 (Vue 3 + Vite).</p>
    </div>
  </footer>
</template>
