<script setup>
import { generarRFC } from '@/utils/rfc';
import JsBarcode from 'jsbarcode';
import Button from 'primevue/button';
import DatePicker from 'primevue/datepicker';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import { nextTick, ref } from 'vue';

// ---- Datos del formulario (v-model los conecta con cada campo) ----
const nombre = ref('');
const paterno = ref('');
const materno = ref('');
const fechaNacimiento = ref(null);
const rfc = ref('');
const error = ref('');

// ---- Datos que se muestran en la tarjeta (solo cambian al presionar GENERAR) ----
const tarjeta = ref({ nombre: 'NOMBRE(S)', apellidos: 'APELLIDOS', id: '' });

// Referencia al <svg> donde JsBarcode dibuja el código de barras
const barcodeSvg = ref(null);

const hoy = new Date();

async function generar() {
    error.value = '';
    try {
        // 1) Calcular el RFC con la lógica de src/utils/rfc.js
        rfc.value = generarRFC({
            nombre: nombre.value,
            paterno: paterno.value,
            materno: materno.value,
            fechaNacimiento: fechaNacimiento.value
        });

        // 2) Actualizar la tarjeta digital
        tarjeta.value = {
            nombre: nombre.value.trim().toUpperCase(),
            apellidos: `${paterno.value.trim()} ${materno.value.trim()}`.trim().toUpperCase(),
            id: rfc.value
        };

        // 3) Esperar a que Vue pinte el <svg> y dibujar el código de barras
        await nextTick();
        JsBarcode(barcodeSvg.value, rfc.value, {
            format: 'CODE128',
            width: 1.7,
            height: 55,
            fontSize: 13,
            margin: 0,
            displayValue: true
        });
    } catch (e) {
        error.value = e.message;
    }
}

function limpiar() {
    nombre.value = paterno.value = materno.value = rfc.value = error.value = '';
    fechaNacimiento.value = null;
    tarjeta.value = { nombre: 'NOMBRE(S)', apellidos: 'APELLIDOS', id: '' };
}
</script>

<template>
    <div class="grid grid-cols-12 gap-6">
        <!-- ============ Columna izquierda: formulario ============ -->
        <div class="col-span-12 lg:col-span-7">
            <div class="card">
                <div class="font-semibold text-lg mb-6 uppercase tracking-wide">Generar el RFC de una persona</div>

                <form class="flex flex-col gap-5" @submit.prevent="generar">
                    <div class="flex flex-col gap-2">
                        <label for="nombre" class="font-medium text-sm">Nombre(s):</label>
                        <InputText id="nombre" v-model="nombre" placeholder="Ej. Susana" fluid />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="paterno" class="font-medium text-sm">Apellido Paterno:</label>
                        <InputText id="paterno" v-model="paterno" placeholder="Ej. Rojas" fluid />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="materno" class="font-medium text-sm">Apellido Materno:</label>
                        <InputText id="materno" v-model="materno" placeholder="Ej. Mérida" fluid />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="fecha" class="font-medium text-sm">Fecha Nacimiento:</label>
                        <DatePicker inputId="fecha" v-model="fechaNacimiento" dateFormat="dd/mm/yy" :maxDate="hoy" showIcon fluid placeholder="dd/mm/aaaa" />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="rfc" class="font-medium text-sm">RFC:</label>
                        <InputText id="rfc" v-model="rfc" readonly placeholder="Se generará aquí" fluid />
                    </div>

                    <Message v-if="error" severity="error" size="small">{{ error }}</Message>

                    <div class="flex gap-3">
                        <Button type="submit" label="GENERAR" icon="pi pi-bolt" severity="success" />
                        <Button type="button" label="Limpiar" icon="pi pi-refresh" severity="secondary" outlined @click="limpiar" />
                    </div>
                </form>
            </div>
        </div>

        <!-- ============ Columna derecha: tarjeta digital ============ -->
        <div class="col-span-12 lg:col-span-5">
            <div class="card">
                <div class="font-semibold text-lg mb-6 uppercase tracking-wide">Tarjeta Digital</div>

                <div class="flex justify-center">
                    <div class="tarjeta">
                        <!-- Fondo con curvas -->
                        <svg class="tarjeta-fondo" viewBox="0 0 260 440" preserveAspectRatio="none" aria-hidden="true">
                            <path d="M0 0H260V120C200 175 70 130 0 190Z" fill="#0b2a4a" />
                            <path d="M0 190C70 130 200 175 260 120V150C200 205 70 160 0 220Z" fill="#1d6fd1" opacity="0.9" />
                            <path d="M0 395C70 355 190 400 260 365V440H0Z" fill="#1d6fd1" />
                            <path d="M0 415C80 385 190 425 260 395V440H0Z" fill="#0b2a4a" />
                        </svg>

                        <!-- Encabezado con "logo" -->
                        <div class="tarjeta-empresa">
                            <svg viewBox="0 0 24 24" class="w-7 h-7" aria-hidden="true">
                                <path d="M12 2l10 10-10 10L2 12z" fill="#fff" />
                                <path d="M12 7l5 5-5 5-5-5z" fill="#0b2a4a" />
                            </svg>
                            <div class="leading-tight text-left">
                                <div class="text-xs font-bold tracking-wider">UNACH</div>
                                <div class="text-[9px] opacity-80">Tarjeta de empleado</div>
                            </div>
                        </div>

                        <!-- Foto (silueta) -->
                        <div class="tarjeta-foto">
                            <svg viewBox="0 0 100 100" aria-hidden="true">
                                <circle cx="50" cy="38" r="17" fill="#0b2a4a" />
                                <path d="M16 92C16 66 32 58 50 58S84 66 84 92Z" fill="#0b2a4a" />
                            </svg>
                        </div>

                        <!-- Datos -->
                        <div class="tarjeta-datos">
                            <div class="text-lg font-extrabold leading-tight text-[#0b2a4a]">{{ tarjeta.nombre }}</div>
                            <div class="text-lg font-extrabold leading-tight text-[#0b2a4a]">{{ tarjeta.apellidos }}</div>
                            <div class="text-sm text-gray-500 mt-1">Empleado/a</div>
                            <div class="text-sm font-semibold text-[#0b2a4a] mt-3 break-all">ID : {{ tarjeta.id || '—' }}</div>

                            <!-- Código de barras -->
                            <div class="mt-3 flex justify-center min-h-[78px]">
                                <svg v-show="tarjeta.id" ref="barcodeSvg" class="max-w-full"></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.tarjeta {
    position: relative;
    width: 260px;
    height: 440px;
    border-radius: 16px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 8px 24px rgba(11, 42, 74, 0.25);
    color: #0b2a4a;
    font-family: 'Lato', sans-serif;
}
.tarjeta-fondo {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
}
.tarjeta-empresa {
    position: absolute;
    top: 18px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    color: #fff;
}
.tarjeta-foto {
    position: absolute;
    top: 62px;
    left: 50%;
    transform: translateX(-50%);
    width: 104px;
    height: 104px;
    border-radius: 50%;
    background: #e8eef6;
    border: 4px solid #fff;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    overflow: hidden;
}
.tarjeta-datos {
    position: absolute;
    top: 188px;
    left: 14px;
    right: 14px;
    text-align: center;
}
</style>
