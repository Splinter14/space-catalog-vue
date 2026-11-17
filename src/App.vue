<script setup>
import { onMounted, ref } from 'vue'
import SiteHeader from '@/components/SiteHeader.vue'
import ProductCard from '@/components/ProductCard.vue'
import { resolveAsset } from '@/utils/formatters'

const products = ref([])
const isLoading = ref(true)
const loadError = ref('')

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

    <section v-else class="catalog-grid">
      <ProductCard
        v-for="product in products"
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
