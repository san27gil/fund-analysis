// Base de datos de fondos
        const fondosDatabase = [
            {
                nombre: 'PIMCO Funds Global - Income Fund - INST EUR',
                gestora: 'PIMCO',
                categoria: 'RF',
                tfcRetail: 1.45,
                tfcLimpia: 0.55,
                isinRetail: 'IE00B84J9L26',
                isinLimpia: 'IE00B80G9288',
                diferencia: 0.90
            },
            {
                nombre: 'JPMorgan US Technology',
                gestora: 'JP Morgan',
                categoria: 'RV Tecnología USA',
                tfcRetail: 1.90,
                tfcLimpia: 0.80,
                isinRetail: 'LU0082616367',
                isinLimpia: 'LU0979428033',
                diferencia: 1.10
            },
            {
                nombre: 'Amundi MSCI World',
                gestora: 'Amundi',
                categoria: 'RV Global',
                tfcRetail: 1.50,
                tfcLimpia: 0.20,
                isinRetail: 'LU1681043599',
                isinLimpia: 'LU1681043672',
                diferencia: 1.30
            },
            {
                nombre: 'BlackRock Global Allocation',
                gestora: 'BlackRock',
                categoria: 'Mixto Global',
                tfcRetail: 1.75,
                tfcLimpia: 0.65,
                isinRetail: 'LU0072462426',
                isinLimpia: 'LU0368265418',
                diferencia: 1.10
            },
            {
                nombre: 'Pictet European Sustainable Equities',
                gestora: 'Pictet',
                categoria: 'RV Europa',
                tfcRetail: 1.95,
                tfcLimpia: 0.85,
                isinRetail: 'LU0144509717',
                isinLimpia: 'LU0255978827',
                diferencia: 1.10
            },
            {
                nombre: 'DWS Top Dividende',
                gestora: 'DWS',
                categoria: 'RV Global Dividendo',
                tfcRetail: 1.60,
                tfcLimpia: 0.50,
                isinRetail: 'DE0009848119',
                isinLimpia: 'LU0507265923',
                diferencia: 1.10
            }
        ];

        let selectedFondo = null;
        let chartEvolucion = null;
        let chartDiferencia = null;

        // Renderizar fondos
        function renderFondos(fondos) {
            const grid = document.getElementById('fondosGrid');
            grid.innerHTML = '';

            fondos.forEach(fondo => {
                const card = document.createElement('div');
                card.className = 'fondo-card';
                if (selectedFondo && selectedFondo.nombre === fondo.nombre) {
                    card.classList.add('selected');
                }

                card.innerHTML = `
                    <div class="fondo-header">
                        <div>
                            <div class="fondo-name">${fondo.nombre}</div>
                            <div class="fondo-gestora">${fondo.gestora}</div>
                        </div>
                        <span class="categoria-badge">${fondo.categoria}</span>
                    </div>
                    <div class="comisiones-grid">
                        <div class="comision-box comision-retail">
                            <div class="comision-label">RETAIL</div>
                            <div class="comision-value">${fondo.tfcRetail.toFixed(2)}%</div>
                            <div class="isin-text">${fondo.isinRetail}</div>
                        </div>
                        <div class="comision-box comision-limpia">
                            <div class="comision-label">LIMPIA</div>
                            <div class="comision-value">${fondo.tfcLimpia.toFixed(2)}%</div>
                            <div class="isin-text">${fondo.isinLimpia}</div>
                        </div>
                    </div>
                    <div class="ahorro-info">
                        <span class="ahorro-label">Diferencia:</span>
                        <span class="ahorro-value">-${fondo.diferencia.toFixed(2)}%</span>
                    </div>
                `;

                card.onclick = () => selectFondo(fondo);
                grid.appendChild(card);
            });
        }

        // Seleccionar fondo
        function selectFondo(fondo) {
            selectedFondo = fondo;
            renderFondos(fondosDatabase);
            document.getElementById('parametrosCard').classList.remove('hidden');
            document.getElementById('parametrosCard').scrollIntoView({ behavior: 'smooth' });
            updateComparativa();
        }

        // Buscar fondos
        function searchFondos(query) {
            if (!query) return fondosDatabase;
            query = query.toLowerCase();
            return fondosDatabase.filter(f => 
                f.nombre.toLowerCase().includes(query) ||
                f.gestora.toLowerCase().includes(query) ||
                f.categoria.toLowerCase().includes(query)
            );
        }

        // Formatear euros
        function formatEuros(valor) {
            return new Intl.NumberFormat('es-ES', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(valor);
        }

        // Calcular proyección
        function calcularProyeccion(capital, rentabilidad, tfc, años) {
            const resultado = [];
            let capitalActual = capital;
            let costesAcumulados = 0;

            for (let año = 0; año <= años; año++) {
                resultado.push({
                    año: año,
                    capital: capitalActual,
                    costesAcumulados: costesAcumulados
                });

                if (año < años) {
                    const rendimiento = capitalActual * rentabilidad;
                    const coste = capitalActual * tfc;
                    capitalActual = capitalActual + rendimiento - coste;
                    costesAcumulados += coste;
                }
            }

            return resultado;
        }

        // Actualizar comparativa
        function updateComparativa() {
            if (!selectedFondo) return;

            const inversionInicial = parseFloat(document.getElementById('inversionInicial').value);
            const años = parseInt(document.getElementById('años').value);
            const rentabilidad = parseFloat(document.getElementById('rentabilidad').value) / 100;
            const comisionAsesor = parseFloat(document.getElementById('comisionAsesor').value) / 100;

            // Calcular proyecciones
            const proyeccionRetail = calcularProyeccion(
                inversionInicial,
                rentabilidad,
                selectedFondo.tfcRetail / 100,
                años
            );

            const proyeccionAsesor = calcularProyeccion(
                inversionInicial,
                rentabilidad,
                (selectedFondo.tfcLimpia + comisionAsesor * 100) / 100,
                años
            );

            // Actualizar UI
            updateResultados(proyeccionRetail, proyeccionAsesor, años);
            updateCharts(proyeccionRetail, proyeccionAsesor, años);
            updateTabla(proyeccionRetail, proyeccionAsesor, años);

            const ventajaTotal = proyeccionAsesor[años].capital - proyeccionRetail[años].capital;
            updatePropuestaValor(ventajaTotal, años);

            document.getElementById('resultadosSection').classList.remove('hidden');
            document.getElementById('resultadosSection').scrollIntoView({ behavior: 'smooth' });
        }

        // Actualizar resultados
        function updateResultados(proyeccionRetail, proyeccionAsesor, años) {
            const comisionAsesor = parseFloat(document.getElementById('comisionAsesor').value);

            document.getElementById('retailTFC').textContent = selectedFondo.tfcRetail.toFixed(2) + '%';
            document.getElementById('retailCostesTotal').textContent = formatEuros(proyeccionRetail[años].costesAcumulados) + '€';
            document.getElementById('retailCapitalFinal').textContent = formatEuros(proyeccionRetail[años].capital) + '€';

            document.getElementById('limpiaTFC').textContent = selectedFondo.tfcLimpia.toFixed(2) + '%';
            document.getElementById('honorarios').textContent = comisionAsesor.toFixed(2) + '%';
            document.getElementById('costeTotal').textContent = (selectedFondo.tfcLimpia + comisionAsesor).toFixed(2) + '%';
            document.getElementById('limpiaCostesTotal').textContent = formatEuros(proyeccionAsesor[años].costesAcumulados) + '€';
            document.getElementById('limpiaCapitalFinal').textContent = formatEuros(proyeccionAsesor[años].capital) + '€';
        }

        // Actualizar gráficos
        function updateCharts(proyeccionRetail, proyeccionAsesor, años) {
            const labels = proyeccionRetail.map(p => p.año);
            const dataRetail = proyeccionRetail.map(p => p.capital);
            const dataAsesor = proyeccionAsesor.map(p => p.capital);
            const dataDiferencia = proyeccionRetail.map((p, i) => proyeccionAsesor[i].capital - p.capital);

            const ventajaTotal = proyeccionAsesor[años].capital - proyeccionRetail[años].capital;

            // Gráfico de evolución
            if (chartEvolucion) {
                chartEvolucion.destroy();
            }

            const ctxEvolucion = document.getElementById('chartEvolucion').getContext('2d');
            chartEvolucion = new Chart(ctxEvolucion, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Banco (Retail sin asesor)',
                            data: dataRetail,
                            borderColor: '#f97316',
                            backgroundColor: 'rgba(249, 115, 22, 0.1)',
                            borderWidth: 3,
                            tension: 0.1
                        },
                        {
                            label: 'EAF (Limpia + Honorarios)',
                            data: dataAsesor,
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            borderWidth: 3,
                            tension: 0.1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': ' + formatEuros(context.parsed.y) + '€';
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            ticks: {
                                callback: function(value) {
                                    return formatEuros(value) + '€';
                                }
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Años'
                            }
                        }
                    }
                }
            });

            // Gráfico de diferencia
            if (chartDiferencia) {
                chartDiferencia.destroy();
            }

            document.getElementById('chartDiferenciaTitle').textContent = 
                ventajaTotal >= 0 ? '💰 Ahorro Acumulado con EAF' : '⚠️ Coste Adicional con EAF';

            const ctxDiferencia = document.getElementById('chartDiferencia').getContext('2d');
            chartDiferencia = new Chart(ctxDiferencia, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: ventajaTotal >= 0 ? 'Ahorro con EAF' : 'Coste adicional',
                        data: dataDiferencia,
                        backgroundColor: ventajaTotal >= 0 ? '#10b981' : '#ef4444'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': ' + formatEuros(context.parsed.y) + '€';
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            ticks: {
                                callback: function(value) {
                                    return formatEuros(value) + '€';
                                }
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Años'
                            }
                        }
                    }
                }
            });
        }

        // Actualizar tabla
        function updateTabla(proyeccionRetail, proyeccionAsesor, años) {
            const tabla = document.getElementById('tablaComparativa');
            const comisionAsesor = parseFloat(document.getElementById('comisionAsesor').value);
            const capitalFinalRetail = proyeccionRetail[años].capital;
            const capitalFinalAsesor = proyeccionAsesor[años].capital;
            const ventajaTotal = capitalFinalAsesor - capitalFinalRetail;

            tabla.innerHTML = `
                <tr>
                    <td style="font-weight: 600;">ISIN</td>
                    <td class="text-center" style="color: #64748b;">${selectedFondo.isinRetail}</td>
                    <td class="text-center" style="color: #64748b;">${selectedFondo.isinLimpia}</td>
                </tr>
                <tr style="background: #f8fafc;">
                    <td style="font-weight: 600;">TFC del fondo</td>
                    <td class="text-center" style="font-weight: bold; color: #f97316;">${selectedFondo.tfcRetail}%</td>
                    <td class="text-center" style="font-weight: bold; color: #10b981;">${selectedFondo.tfcLimpia}%</td>
                </tr>
                <tr>
                    <td style="font-weight: 600;">Honorarios asesoramiento</td>
                    <td class="text-center" style="color: #94a3b8;">-</td>
                    <td class="text-center" style="font-weight: bold; color: #4338ca;">${comisionAsesor}%</td>
                </tr>
                <tr style="background: #eef2ff; font-weight: bold;">
                    <td>Coste total anual</td>
                    <td class="text-center" style="color: #f97316;">${selectedFondo.tfcRetail.toFixed(2)}%</td>
                    <td class="text-center" style="color: #10b981;">${(selectedFondo.tfcLimpia + comisionAsesor).toFixed(2)}%</td>
                </tr>
                <tr>
                    <td style="font-weight: 600;">Capital final (${años} años)</td>
                    <td class="text-center" style="font-weight: bold; color: #f97316;">${formatEuros(capitalFinalRetail)}€</td>
                    <td class="text-center" style="font-weight: bold; color: #10b981;">${formatEuros(capitalFinalAsesor)}€</td>
                </tr>
                <tr style="background: ${ventajaTotal >= 0 ? '#f0fdf4' : '#fef2f2'}; font-weight: bold;">
                    <td>Diferencia para el cliente</td>
                    <td class="text-center">-</td>
                    <td class="text-center" style="color: ${ventajaTotal >= 0 ? '#16a34a' : '#dc2626'}; font-size: 16px;">
                        ${ventajaTotal >= 0 ? '+' : ''}${formatEuros(ventajaTotal)}€
                    </td>
                </tr>
            `;
        }

        // Actualizar propuesta de valor
        function updatePropuestaValor(ventajaTotal, años) {
            const container = document.getElementById('propuestaValor');
            const comisionAsesor = parseFloat(document.getElementById('comisionAsesor').value);

            if (ventajaTotal >= 0) {
                container.className = 'propuesta-valor';
                container.innerHTML = `
                    <h4 class="propuesta-titulo">
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        Propuesta de Valor para tu Cliente
                    </h4>
                    <p class="propuesta-texto"><strong>Contratando tus servicios como EAF, el cliente obtiene:</strong></p>
                    <ul class="propuesta-lista">
                        <li>
                            <span class="checkmark">✓</span>
                            <span><strong>Ahorro de ${formatEuros(ventajaTotal)}€</strong> en ${años} años frente a la opción del banco</span>
                        </li>
                        <li>
                            <span class="checkmark">✓</span>
                            <span><strong>Asesoramiento profesional e independiente</strong> sin conflictos de interés</span>
                        </li>
                        <li>
                            <span class="checkmark">✓</span>
                            <span><strong>Acceso a clases limpias</strong> con menores comisiones</span>
                        </li>
                        <li>
                            <span class="checkmark">✓</span>
                            <span><strong>Transparencia total</strong> en costes y recomendaciones</span>
                        </li>
                    </ul>
                `;
            } else {
                const comisionSugerida = Math.max(0, selectedFondo.tfcRetail - selectedFondo.tfcLimpia - 0.1).toFixed(2);
                const costeTotalAsesor = (selectedFondo.tfcLimpia + comisionAsesor).toFixed(2);
                
                container.className = 'alerta-ajuste';
                container.innerHTML = `
                    <h4 class="alerta-titulo">
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Ajusta tus Honorarios
                    </h4>
                    <p class="alerta-texto">
                        Con la comisión actual de <strong>${comisionAsesor}%</strong>, el coste total (${costeTotalAsesor}%) 
                        supera al retail (${selectedFondo.tfcRetail.toFixed(2)}%). Considera reducir tus honorarios 
                        a <strong>${comisionSugerida}%</strong> o menos para ofrecer una ventaja económica clara al cliente, 
                        además del valor del asesoramiento.
                    </p>
                `;
            }

            container.classList.remove('hidden');
        }

        // Event listeners
        document.getElementById('searchInput').addEventListener('input', function(e) {
            const fondosFiltrados = searchFondos(e.target.value);
            renderFondos(fondosFiltrados);
        });

        // Inicializar
        renderFondos(fondosDatabase);