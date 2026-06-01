<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Producto;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Crear usuarios
        $testUser = User::factory()->create([
            'nombre' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // 1. Crear usuarios
        $admin = User::factory()->create([
            'nombre' => 'Admin User',
            'email' => 'admin@example.com',
            'rol' => 'ADMIN',
        ]);

        $userAlex = User::factory()->create([
            'nombre' => 'Alex García',
            'email' => 'alex@example.com',
        ]);

        $userMarta = User::factory()->create([
            'nombre' => 'Marta Martínez',
            'email' => 'marta@example.com',
        ]);

        $userSofia = User::factory()->create([
            'nombre' => 'Sofía Rodríguez',
            'email' => 'sofia@example.com',
        ]);

        // 2. Crear productos
        $logitechMouse = Producto::create([
            'marca' => 'Logitech',
            'modelo' => 'G Pro X Superlight',
            'tipo' => 'RATON',
            'descripcion' => 'Diseñado con la colaboración de los principales profesionales de esports del mundo. Con un peso inferior a 63 gramos y una forma minimalista que ofrece una velocidad de respuesta incomparable.',
            'fecha_salida' => '2021-01-15',
        ]);

        $razerKeyboard = Producto::create([
            'marca' => 'Razer',
            'modelo' => 'Huntsman V2',
            'tipo' => 'TECLADO',
            'descripcion' => 'Teclado óptico gaming con switches analógicos Razer para un control milimétrico del juego, teclas de PBT de doble inyección y reposamuñecas ergonómico premium.',
            'fecha_salida' => '2021-09-20',
        ]);

        $hyperxHeadset = Producto::create([
            'marca' => 'HyperX',
            'modelo' => 'Cloud II Wireless',
            'tipo' => 'AURICULAR',
            'descripcion' => 'Auriculares inalámbricos de alta fidelidad con sonido envolvente 7.1 virtual, estructura de aluminio duradera y almohadillas de espuma viscoelástica para una comodidad legendaria.',
            'fecha_salida' => '2020-11-10',
        ]);

        $asusMonitor = Producto::create([
            'marca' => 'ASUS',
            'modelo' => 'ROG Swift PG279QM',
            'tipo' => 'MONITOR',
            'descripcion' => 'Pantalla de juegos IPS de 27 pulgadas QHD (2560 x 1440) con frecuencia de actualización ultrarrápida de 240 Hz diseñada para jugadores profesionales y acción rápida.',
            'fecha_salida' => '2021-06-01',
        ]);

        // 3. Crear características detalladas
        \App\Models\CaracteristicaDetallada::create([
            'producto_id' => $logitechMouse->id,
            'dimensiones' => '125 x 63.5 x 40 mm',
            'peso' => '63 g',
            'conexion' => 'LIGHTSPEED Inalámbrico / USB-A',
            'color' => 'Negro / Blanco',
            'especificaciones_json' => json_encode([
                'Sensor' => 'HERO 25K',
                'Resolución' => '100 - 25,600 DPI',
                'Autonomía de batería' => '70 horas de movimiento constante',
                'Procesador' => 'ARM de 32 bits'
            ])
        ]);

        \App\Models\CaracteristicaDetallada::create([
            'producto_id' => $razerKeyboard->id,
            'dimensiones' => '445 x 140 x 43 mm',
            'peso' => '1040 g',
            'conexion' => 'Cable USB-C de fibra trenzada',
            'color' => 'Negro',
            'especificaciones_json' => json_encode([
                'Switches' => 'Razer Analog Optical Switches',
                'Tasa de sondeo' => '8000 Hz',
                'Durabilidad' => '100 millones de pulsaciones',
                'Iluminación' => 'Razer Chroma RGB'
            ])
        ]);

        \App\Models\CaracteristicaDetallada::create([
            'producto_id' => $hyperxHeadset->id,
            'dimensiones' => '190 x 136 x 93 mm',
            'peso' => '309 g',
            'conexion' => 'Inalámbrico de 2.4 GHz (alcance hasta 20m)',
            'color' => 'Negro y Rojo',
            'especificaciones_json' => json_encode([
                'Altavoces' => 'Dinámicos de 53 mm con imanes de neodimio',
                'Respuesta de frecuencia' => '15 Hz - 20 kHz',
                'Autonomía de batería' => 'Hasta 30 horas',
                'Micrófono' => 'Condensador electret unidireccional con cancelación de ruido'
            ])
        ]);

        \App\Models\CaracteristicaDetallada::create([
            'producto_id' => $asusMonitor->id,
            'dimensiones' => '614 x 508 x 255 mm (con soporte)',
            'peso' => '8.1 kg',
            'conexion' => 'DisplayPort 1.4, HDMI 2.0 x3, USB 3.0 Hub x2',
            'color' => 'Gris Oscuro / Aura Sync RGB',
            'especificaciones_json' => json_encode([
                'Tipo de panel' => 'Fast IPS',
                'Resolución nativa' => '2560 x 1440 (2K QHD)',
                'Frecuencia máx.' => '240 Hz',
                'Tiempo de respuesta' => '1 ms (GTG)',
                'Soporte HDR' => 'HDR10 / VESA DisplayHDR 400'
            ])
        ]);

        // 4. Crear reseñas
        \App\Models\Resenia::create([
            'user_id' => $userAlex->id,
            'producto_id' => $logitechMouse->id,
            'puntuacion' => 9,
            'comentario' => 'Es sin duda el mejor ratón que he probado. El peso es espectacular y el deslizamiento es súper suave. La batería dura semanas y no noto nada de latencia.',
            'voto_up' => 15,
            'voto_down' => 1,
            'visible' => true,
        ]);

        \App\Models\Resenia::create([
            'user_id' => $userMarta->id,
            'producto_id' => $logitechMouse->id,
            'puntuacion' => 8,
            'comentario' => 'Muy cómodo para agarre tipo garra (claw grip). Sin embargo, considero que el conector Micro-USB que trae para cargarlo está desfasado para su precio.',
            'voto_up' => 5,
            'voto_down' => 0,
            'visible' => true,
        ]);

        \App\Models\Resenia::create([
            'user_id' => $userSofia->id,
            'producto_id' => $razerKeyboard->id,
            'puntuacion' => 10,
            'comentario' => 'Los switches ópticos analógicos son increíbles. Puedes configurar el punto de actuación de cada tecla. La calidad de construcción es excepcional.',
            'voto_up' => 23,
            'voto_down' => 2,
            'visible' => true,
        ]);

        \App\Models\Resenia::create([
            'user_id' => $userAlex->id,
            'producto_id' => $hyperxHeadset->id,
            'puntuacion' => 8,
            'comentario' => 'La comodidad clásica del Cloud II pero sin la molestia de los cables. El audio 7.1 es decente y el micrófono cumple bastante bien. Carga por USB-C.',
            'voto_up' => 12,
            'voto_down' => 3,
            'visible' => true,
        ]);

        \App\Models\Resenia::create([
            'user_id' => $userMarta->id,
            'producto_id' => $asusMonitor->id,
            'puntuacion' => 10,
            'comentario' => 'Los 240Hz en panel IPS se ven espectaculares. El color es ultra preciso directo de fábrica. El módulo G-Sync nativo hace que todo vaya fluido sin tearing.',
            'voto_up' => 30,
            'voto_down' => 0,
            'visible' => true,
        ]);
    }
}
