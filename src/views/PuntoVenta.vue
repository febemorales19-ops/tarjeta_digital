<script setup>
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import DataTable from 'primevue/datatable';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import { computed, ref } from 'vue';

const toast = useToast();
const confirm = useConfirm();

const TASA_IVA = 0.16;

// ---- Lista de productos que muestra la tabla ----
// cns = consecutivo, p_unit = precio unitario, cant = cantidad
const productos = ref([
    { cns: 1, nombre: 'Impresora LaserJet Color', p_unit: 5200, cant: 2 },
    { cns: 2, nombre: 'Monitor LED 31 plg.', p_unit: 1700, cant: 3 }
]);

// ---- Campos del formulario superior ----
const nombre = ref('');
const cantidad = ref(null);
const precio = ref(null);
const editandoCns = ref(null); // null = estamos registrando; número = estamos editando ese producto

const modoEdicion = computed(() => editandoCns.value !== null);

// ---- Cálculos: se recalculan solos cada vez que cambia la lista ----
const subtotal = computed(() => productos.value.reduce((suma, p) => suma + p.p_unit * p.cant, 0));
const iva = computed(() => subtotal.value * TASA_IVA);
const total = computed(() => subtotal.value + iva.value);

const moneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const dinero = (valor) => moneda.format(valor);

function aviso(severity, summary, detail) {
    toast.add({ severity, summary, detail, life: 3000 });
}

function limpiarFormulario() {
    nombre.value = '';
    cantidad.value = null;
    precio.value = null;
    editandoCns.value = null;
}

// ---- Registrar (o actualizar si estamos editando) ----
function guardar() {
    const nom = nombre.value.trim();
    if (!nom || !cantidad.value || cantidad.value < 1 || !precio.value || precio.value <= 0) {
        aviso('warn', 'Faltan datos', 'Escribe el nombre, una cantidad de 1 o más y un precio mayor a 0.');
        return;
    }

    if (modoEdicion.value) {
        const producto = productos.value.find((p) => p.cns === editandoCns.value);
        producto.nombre = nom;
        producto.cant = cantidad.value;
        producto.p_unit = precio.value;
        aviso('success', 'Producto actualizado', nom);
    } else {
        productos.value.push({
            cns: productos.value.length + 1,
            nombre: nom,
            p_unit: precio.value,
            cant: cantidad.value
        });
        aviso('success', 'Producto registrado', nom);
    }
    limpiarFormulario();
}

// ---- Editar: sube los datos del producto al formulario ----
function editar(producto) {
    editandoCns.value = producto.cns;
    nombre.value = producto.nombre;
    cantidad.value = producto.cant;
    precio.value = producto.p_unit;
}

// ---- Eliminar: pide confirmación y renumera el consecutivo ----
function eliminar(producto) {
    confirm.require({
        header: 'Eliminar producto',
        message: `¿Seguro que quieres eliminar "${producto.nombre}"?`,
        icon: 'pi pi-exclamation-triangle',
        rejectProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
        acceptProps: { label: 'Eliminar', severity: 'danger' },
        accept: () => {
            productos.value = productos.value.filter((p) => p.cns !== producto.cns);
            productos.value.forEach((p, i) => (p.cns = i + 1));
            if (editandoCns.value === producto.cns) limpiarFormulario();
            aviso('info', 'Producto eliminado', producto.nombre);
        }
    });
}
</script>

<template>
    <div class="card">
        <div class="font-semibold text-sm uppercase tracking-wide mb-4">Punto de venta (POS)</div>

        <!-- Barra para registrar o editar un producto -->
        <form class="flex flex-wrap items-center gap-3 p-4 mb-4 rounded border border-surface" @submit.prevent="guardar">
            <InputText v-model="nombre" placeholder="Nombre del producto..." class="flex-1 min-w-48" />
            <div class="w-28"><InputNumber v-model="cantidad" placeholder="Cant" :min="1" :useGrouping="false" fluid /></div>
            <div class="w-40"><InputNumber v-model="precio" placeholder="$ Precio U." mode="currency" currency="MXN" locale="es-MX" :min="0" fluid /></div>
            <Button v-if="modoEdicion" type="button" label="Cancelar" severity="secondary" outlined @click="limpiarFormulario" />
            <Button type="submit" :label="modoEdicion ? 'Actualizar' : 'Registrar'" :icon="modoEdicion ? 'pi pi-check' : 'pi pi-plus'" severity="success" />
        </form>

        <!-- Tabla de productos -->
        <DataTable
            :value="productos"
            dataKey="cns"
            showGridlines
            paginator
            :rows="5"
            :rowsPerPageOptions="[5, 10, 20]"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Visualizando {last} de {totalRecords} productos"
        >
            <template #empty>
                <div class="text-center py-4 text-muted-color">No hay productos registrados.</div>
            </template>

            <Column field="cns" header="Cns" sortable style="width: 6rem" />
            <Column field="nombre" header="Nombre del Producto" />
            <Column field="p_unit" header="Precio U." style="width: 9rem">
                <template #body="{ data }">{{ dinero(data.p_unit) }}</template>
            </Column>
            <Column field="cant" header="Cant." style="width: 6rem" />
            <Column header="Precio P." style="width: 9rem">
                <template #body="{ data }">{{ dinero(data.p_unit * data.cant) }}</template>
            </Column>
            <Column header="Acciones" style="width: 9rem">
                <template #body="{ data }">
                    <div class="flex gap-1">
                        <Button icon="pi pi-pencil" severity="success" size="small" aria-label="Editar" @click="editar(data)" />
                        <Button icon="pi pi-trash" severity="danger" size="small" aria-label="Eliminar" @click="eliminar(data)" />
                    </div>
                </template>
            </Column>
        </DataTable>

        <!-- Totales -->
        <div class="flex flex-wrap justify-end items-center gap-x-6 gap-y-3 p-4 mt-6 rounded border border-surface">
            <div class="flex items-center gap-2">
                <label for="subtotal" class="text-sm">Subtotal:</label>
                <InputText id="subtotal" :modelValue="dinero(subtotal)" readonly class="w-40" />
            </div>
            <div class="flex items-center gap-2">
                <label for="iva" class="text-sm">IVA (16%):</label>
                <InputText id="iva" :modelValue="dinero(iva)" readonly class="w-40" />
            </div>
            <div class="flex items-center gap-2">
                <label for="total" class="text-sm">Total:</label>
                <InputText id="total" :modelValue="dinero(total)" readonly class="w-40 font-bold" />
            </div>
        </div>
    </div>

    <ConfirmDialog />
</template>
