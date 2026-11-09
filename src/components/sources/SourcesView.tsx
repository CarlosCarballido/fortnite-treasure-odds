import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { REFERENCE_SOURCES } from '../../config/constants';
import { ExternalLink, BookOpen, ShieldCheck, Sigma } from 'lucide-react';

export const SourcesView: React.FC = () => {
  const glossaryTerms = [
    {
      term: 'Ensayos de Bernoulli Independientes',
      formula: 'P = 1 - (1 - p)^n',
      desc: 'Cada cofre abierto es un evento probabilístico independiente. Que hayas abierto 50.000 cofres sin obtener el premio no incrementa la probabilidad del siguiente cofre, que permanece fija en su tasa base o con bonus.',
    },
    {
      term: 'Estabilidad Numérica con log1p y expm1',
      formula: 'P = -Math.expm1(n * Math.log1p(-p))',
      desc: 'Cuando p es minúsculo (ej. 1/137.500 ≈ 0.00000727), el cálculo ingenuo (1 - p)^n sufre de cancelación catastrófica de coma flotante IEEE 754. Math.log1p(-p) calcula exactamente ln(1 - p) y Math.expm1(x) calcula e^x - 1 sin pérdida de bits.',
    },
    {
      term: 'Distribución Geométrica y Mediana',
      formula: 'Mediana = ceil( ln(0.5) / ln(1 - p) )',
      desc: 'Modela el número de cofres hasta el primer éxito. Para la ficha pirata sin bono, la esperanza matemática (media) es 137.500 cofres, pero la mediana es 95.308 cofres (el 50% de los jugadores lo habrán conseguido antes de ese punto).',
    },
    {
      term: 'Intervalo de Confianza Wilson al 95%',
      formula: '(p̂ + z²/2N ± z√(p̂(1-p̂)/N + z²/4N²)) / (1 + z²/N)',
      desc: 'A diferencia de la aproximación normal de Wald, el intervalo de Wilson no colapsa a ancho cero cuando en la simulación se obtienen 0 éxitos. Proporciona una cota superior e inferior estadísticamente honesta para eventos raros.',
    },
    {
      term: 'Modelo Categórico vs. Sorteos Independientes',
      formula: 'Modo A (Excluyente) vs. Modo B (Independiente)',
      desc: 'Se publicaron las probabilidades marginales por categoría, pero no el código de sorteo interno. Este simulador permite evaluar tanto el sorteo de una tabla de tesoros excluyentes (máximo 1 tesoro) como tiradas independientes Bernoulli por premio.',
    },
    {
      term: 'Deduplicación y Bloqueo de No Repetibles',
      formula: 'Drop vs. Renormalización',
      desc: 'Se indicó que los tesoros no se repiten (salvo Gizmos). Al conseguir un premio, su peso puede eliminarse de la ruleta (Drop) o redistribuirse proporcionalmente entre los restantes premios pendientes (Redistribución).',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-gaming font-bold text-slate-100 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-amber-400" />
          Datos, Fuentes de Consulta y Glosario Matemático
        </h2>
        <p className="text-xs text-slate-400">
          Transparencia absoluta: verificación de fuentes públicas, citas de referencia y fundamentación probabilística.
        </p>
      </div>

      {/* Reference Sources Grid */}
      <Card className="p-5 bg-slate-900/90 border-slate-800">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Fuentes de Información y Datos Publicados (Cazatesoros 2026)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REFERENCE_SOURCES.map((source) => (
            <div
              key={source.id}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="source" source={source.certainty}>
                    {source.certainty === 'public_data' ? 'Dato Público' : 'Reporte de Terceros'}
                  </Badge>
                  <span className="text-[11px] text-slate-500">{source.date}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-200 mb-1">{source.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">{source.description}</p>
              </div>

              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors pt-2 border-t border-slate-800/80"
              >
                <span>Visitar fuente original</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </Card>

      {/* Mathematical Glossary */}
      <Card className="p-5 bg-slate-900/90 border-slate-800">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-4">
          <Sigma className="w-4 h-4 text-purple-400" />
          Glosario de Fundamentación Matemática y Estadística
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {glossaryTerms.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 text-sm font-gaming">{item.term}</span>
              </div>
              <code className="block bg-slate-900 text-cyan-300 px-2 py-1 rounded text-[11px] font-mono border border-slate-800">
                {item.formula}
              </code>
              <p className="text-slate-400 leading-relaxed text-[11px] pt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Disclaimers & Legal Notice */}
      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 leading-relaxed space-y-2">
        <strong className="text-amber-400 block text-sm font-gaming">Aviso Legal y Descargo de Responsabilidad</strong>
        <p>
          <strong>Fortnite</strong> es una marca comercial registrada de <strong>Epic Games, Inc.</strong>
        </p>
        <p>
          Este sitio web y sus simuladores son un proyecto <strong>totalmente independiente, no comercial y comunitario</strong>,
          creado por fans con propósitos estrictamente educativos, estadísticos y de análisis probabilístico.
        </p>
        <p>
          Este software <strong>NO</strong> está afiliado, patrocinado, respaldado, administrado ni certificado por Epic Games, Inc.
          ni por ninguna de sus empresas subsidiarias o asociadas. No existe ninguna relación comercial ni técnica entre el autor
          y los propietarios de la marca.
        </p>
        <p className="text-slate-500 text-[11px]">
          Esta aplicación opera de manera local en el navegador web del usuario y no interactúa, no modifica, no extrae datos
          ni se conecta a servidores de juego de terceros.
        </p>
      </div>
    </div>
  );
};
