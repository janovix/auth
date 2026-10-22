"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	ArrowRight,
	ExternalLink,
	Shield,
	Scale,
	Landmark,
	ChevronDown,
	Check,
	AlertTriangle,
	Target,
	FileCheck,
	Gavel,
	BookOpen,
	FileText,
	Download,
	X,
} from "lucide-react";

const BUNKER_SERVICES = [
	{
		icon: <Shield className="h-6 w-6" />,
		title: "Prevención de Lavado de Dinero",
		description:
			"Cumplimiento con la LFPIORPI, reduciendo el riesgo de sanciones millonarias.",
		highlights: [
			"Alta y baja de actividades vulnerables ante la SHCP",
			"Elaboración de avisos mensuales",
			"Desarrollo de manuales de PLD/FT",
			"Identificación y conocimiento del cliente (KYC)",
			"Capacitación especializada en PLD/FT",
		],
	},
	{
		icon: <Scale className="h-6 w-6" />,
		title: "Defensa Fiscal Estratégica",
		description:
			"Defensa frente a actos de autoridad fiscal con estrategias personalizadas.",
		highlights: [
			"Asesoría fiscal preventiva",
			"Defensa ante auditorías del SAT",
			"Amparos en materia fiscal",
			"Recursos administrativos",
			"Planeación fiscal legal",
		],
	},
	{
		icon: <Landmark className="h-6 w-6" />,
		title: "Protección de Capitales",
		description:
			"Resguardo de patrimonio frente a riesgos jurídicos y fiscales.",
		highlights: [
			"Estructuración patrimonial",
			"Fideicomisos de protección",
			"Blindaje de activos",
			"Asesoría en inversiones",
			"Cumplimiento regulatorio",
		],
	},
];

const PLD_OBLIGATIONS = [
	{
		title: "¿Quiénes son sujetos obligados?",
		icon: <Target className="h-4 w-4" />,
		content:
			"Las personas físicas y morales que realicen actividades vulnerables conforme a la LFPIORPI, tales como: compraventa de inmuebles, vehículos, joyas, obras de arte; servicios de blindaje; juegos con apuestas; servicios notariales; operaciones de mutuo; y préstamos o créditos, entre otros.",
	},
	{
		title: "Obligaciones principales",
		icon: <FileCheck className="h-4 w-4" />,
		content:
			"Los sujetos obligados deben darse de alta ante el SAT en el portal de PLD, identificar a sus clientes (KYC), resguardar documentación por 5 años, presentar avisos mensuales a la SHCP, y contar con un manual de cumplimiento y un oficial de cumplimiento designado.",
	},
	{
		title: "Sanciones por incumplimiento",
		icon: <Gavel className="h-4 w-4" />,
		content:
			"El incumplimiento puede resultar en multas de hasta 65,000 UMAs (aproximadamente $7 millones MXN), además de la posible inhabilitación para ejercer la actividad y responsabilidad penal en casos graves.",
	},
	{
		title: "Avisos mensuales ante la SHCP",
		icon: <BookOpen className="h-4 w-4" />,
		content:
			"Se deben presentar avisos de operaciones que igualen o superen los umbrales establecidos por la ley. Los avisos se presentan a través del portal de PLD del SAT de forma mensual, dentro de los primeros 17 días hábiles del mes siguiente.",
	},
];

export function TaxComplianceBanner() {
	const [modalOpen, setModalOpen] = useState(false);
	const [expandedService, setExpandedService] = useState<number | null>(null);
	const [expandedObligation, setExpandedObligation] = useState<number | null>(
		null,
	);

	return (
		<>
			{/* Banner */}
			<div className="group relative min-w-0 overflow-hidden rounded-xl @container/tax-banner">
				{/* Animated border glow */}
				<div
					className="absolute -inset-px rounded-xl animate-border-glow"
					aria-hidden="true"
				/>

				{/* Inner content with navy bg */}
				<div className="relative isolate rounded-[11px] overflow-hidden">
					<div
						className="absolute inset-0 z-0 bg-[#0a0e2a] [transform:translateZ(-1px)]"
						aria-hidden="true"
					>
						<div className="absolute inset-0 flex items-center justify-center overflow-hidden select-none pointer-events-none">
							<span
								className="animate-float text-[14rem] font-serif font-bold leading-none text-[#111b5e] opacity-50"
								style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
							>
								&amp;
							</span>
						</div>
						<div className="absolute inset-0 overflow-hidden">
							<div className="animate-shimmer absolute inset-y-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
						</div>
						<div className="animate-pulse-glow absolute -right-16 -top-8 h-48 w-48 rounded-full bg-[#1a2470]/30 blur-3xl" />
						<div
							className="animate-pulse-glow absolute -left-12 -bottom-12 h-36 w-36 rounded-full bg-[#12195a]/40 blur-3xl"
							style={{ animationDelay: "1.5s" }}
						/>
					</div>

					<div className="relative z-10 flex flex-col items-center gap-4 px-5 py-8 text-center sm:px-8 sm:py-8 @2xl/tax-banner:flex-row @2xl/tax-banner:items-center @2xl/tax-banner:gap-5 @2xl/tax-banner:text-left [transform:translateZ(0)]">
						{/* Logos */}
						<div className="flex shrink-0 items-center gap-3">
							<Image
								src="/janovix-logo.svg"
								alt="JANOVIX"
								width={72}
								height={12}
								className="shrink-0"
							/>
							<div className="h-5 w-px bg-white/30" aria-hidden="true" />
							<Image
								src="/bunker-logo.svg"
								alt="Tax & Compliance"
								width={80}
								height={30}
								className="shrink-0 brightness-0 invert"
							/>
						</div>

						{/* Text */}
						<div className="w-full min-w-0 flex-1">
							<p className="text-sm font-semibold text-white">
								Incluye soporte legal de Tax &amp; Compliance
							</p>
							<p className="mt-1 text-xs text-blue-200 leading-relaxed">
								Defensa Fiscal, Prevención de Lavado de Dinero y Protección de
								Capitales.
							</p>
						</div>

						{/* CTAs */}
						<div className="flex w-full flex-wrap justify-center gap-2 @2xl/tax-banner:w-auto @2xl/tax-banner:shrink-0 @2xl/tax-banner:justify-start">
							<Button
								onClick={() => setModalOpen(true)}
								size="sm"
								className="bg-white text-[#0a0e2a] hover:bg-blue-50 gap-1.5 font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02]"
							>
								Conocer más
								<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
							</Button>
							<Button
								variant="outline"
								size="sm"
								asChild
								className="border-white/20 text-white hover:bg-white/10 gap-1.5 backdrop-blur-sm bg-transparent"
							>
								<a
									href="https://www.bunkerfiscal.com/"
									target="_blank"
									rel="noopener noreferrer"
								>
									Visitar sitio
									<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
								</a>
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Tax & Compliance Modal */}
			<Dialog open={modalOpen} onOpenChange={setModalOpen}>
				<DialogContent
					className="sm:max-w-3xl p-0 overflow-hidden border-0 gap-0 [&>button]:hidden"
					overlayClassName="bg-black/80"
					style={{ backgroundColor: "#0a0e2a" }}
				>
					<DialogTitle className="sr-only">
						Tax &amp; Compliance Consultores
					</DialogTitle>
					<ScrollArea className="max-h-[90vh]">
						<div className="relative">
							{/* Close button */}
							<button
								onClick={() => setModalOpen(false)}
								className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-all hover:bg-white/25 hover:scale-110 press-scale"
								aria-label="Cerrar"
							>
								<X className="h-4 w-4" />
							</button>

							{/* Hero */}
							<div className="relative isolate overflow-hidden px-8 pb-8 pt-12 sm:px-10">
								<div
									className="absolute inset-0 z-0 pointer-events-none select-none [transform:translateZ(-1px)]"
									aria-hidden="true"
								>
									<div className="absolute inset-0 flex items-center justify-center overflow-hidden">
										<span
											className="animate-float text-[22rem] font-serif font-bold leading-none text-[#111b5e] opacity-50"
											style={{
												fontFamily: 'Georgia, "Times New Roman", serif',
											}}
										>
											&amp;
										</span>
									</div>
									<div className="animate-pulse-glow absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#1a2470]/40 blur-3xl" />
									<div className="absolute inset-0 overflow-hidden">
										<div className="animate-shimmer absolute inset-y-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
									</div>
								</div>

								<div className="relative z-10 flex flex-col items-center text-center [transform:translateZ(0)]">
									<div className="animate-scale-in mb-6 flex items-center gap-4">
										<Image
											src="/janovix-logo.svg"
											alt="JANOVIX"
											width={100}
											height={16}
											className="shrink-0"
										/>
										<div className="h-7 w-px bg-white/20" aria-hidden="true" />
										<Image
											src="/bunker-logo.svg"
											alt="Tax & Compliance"
											width={120}
											height={45}
											className="shrink-0 brightness-0 invert"
										/>
									</div>

									<h2
										className="animate-slide-in max-w-lg text-2xl font-bold tracking-tight text-white sm:text-3xl text-balance leading-tight"
										style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
									>
										Te damos la seguridad legal y la herramienta para
										ejecutarla.
									</h2>
									<p className="animate-slide-in-d1 mt-3 max-w-sm text-sm text-blue-200 leading-relaxed">
										PLD sin complicaciones ni procesos manuales.
									</p>

									<div className="animate-slide-in-d2 mt-6 flex gap-8">
										{[
											{ value: "50+", label: "Auditorías" },
											{ value: "20+", label: "Metodologías" },
											{ value: "10+", label: "Años exp." },
										].map((stat) => (
											<div key={stat.label} className="text-center">
												<span className="block text-2xl font-bold text-white">
													{stat.value}
												</span>
												<span className="text-[10px] text-blue-300 uppercase tracking-wider">
													{stat.label}
												</span>
											</div>
										))}
									</div>
								</div>
							</div>

							{/* Quote */}
							<div className="animate-slide-in-d3 mx-8 sm:mx-10 border-t border-b border-white/10 py-4">
								<p
									className="text-center text-sm italic text-blue-200"
									style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
								>
									&quot;En El Bunker, nos aseguramos de que nada amenace lo que
									es tuyo.&quot;
								</p>
							</div>

							{/* Content sections */}
							<div className="px-8 pt-8 sm:px-10">
								{/* Services */}
								<h3 className="animate-slide-in-d4 text-base font-bold text-white">
									Servicios Especializados
								</h3>
								<p className="animate-slide-in-d4 mt-1 text-xs text-blue-300">
									Áreas de práctica que complementan tu operación en JANOVIX.
								</p>

								<div className="mt-4 space-y-3">
									{BUNKER_SERVICES.map((service, i) => (
										<div
											key={service.title}
											className="animate-slide-in"
											style={{ animationDelay: `${0.45 + i * 0.08}s` }}
										>
											<button
												type="button"
												onClick={() =>
													setExpandedService(expandedService === i ? null : i)
												}
												className="hover-lift press-scale flex w-full items-center gap-3 py-2 text-left rounded-md px-2 -mx-2 transition-colors hover:bg-white/[0.03]"
												aria-expanded={expandedService === i}
											>
												<span
													className="text-blue-300 shrink-0"
													aria-hidden="true"
												>
													{service.icon}
												</span>
												<div className="flex-1 min-w-0">
													<span className="text-sm font-semibold text-white">
														{service.title}
													</span>
													<p className="text-xs text-blue-300 mt-0.5">
														{service.description}
													</p>
												</div>
												<ChevronDown
													className={cn(
														"h-4 w-4 shrink-0 text-blue-300 transition-transform duration-200",
														expandedService === i && "rotate-180",
													)}
													aria-hidden="true"
												/>
											</button>
											{expandedService === i && (
												<ul className="animate-expand-down ml-9 space-y-1.5 pb-2">
													{service.highlights.map((item) => (
														<li key={item} className="flex items-start gap-2">
															<Check
																className="h-3 w-3 shrink-0 text-blue-300 mt-0.5"
																aria-hidden="true"
															/>
															<span className="text-xs text-blue-200">
																{item}
															</span>
														</li>
													))}
												</ul>
											)}
											{i < BUNKER_SERVICES.length - 1 && (
												<div className="border-b border-white/10" />
											)}
										</div>
									))}
								</div>

								{/* PLD/FT */}
								<div
									className="mt-8 animate-slide-in"
									style={{ animationDelay: "0.7s" }}
								>
									<h3 className="text-base font-bold text-white">PLD/FT</h3>
									<p className="mt-1 text-xs text-blue-300">
										Información esencial para sujetos obligados.
									</p>

									<div className="mt-3 flex items-start gap-2.5 rounded-md bg-amber-500/10 border border-amber-400/20 px-3 py-2.5">
										<AlertTriangle
											className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5"
											aria-hidden="true"
										/>
										<p className="text-xs text-amber-200 leading-relaxed">
											El incumplimiento de la LFPIORPI puede resultar en multas
											de hasta $7M MXN.
										</p>
									</div>

									<div className="mt-4 space-y-1">
										{PLD_OBLIGATIONS.map((obl, i) => (
											<div key={obl.title}>
												<button
													type="button"
													onClick={() =>
														setExpandedObligation(
															expandedObligation === i ? null : i,
														)
													}
													className="hover-lift press-scale flex w-full items-center gap-2.5 py-2.5 text-left rounded-md px-2 -mx-2 transition-colors hover:bg-white/[0.03]"
													aria-expanded={expandedObligation === i}
												>
													<span
														className="text-blue-300 shrink-0"
														aria-hidden="true"
													>
														{obl.icon}
													</span>
													<span className="flex-1 text-xs font-semibold text-white">
														{obl.title}
													</span>
													<ChevronDown
														className={cn(
															"h-3.5 w-3.5 shrink-0 text-blue-300 transition-transform duration-200",
															expandedObligation === i && "rotate-180",
														)}
														aria-hidden="true"
													/>
												</button>
												{expandedObligation === i && (
													<p className="animate-expand-down ml-7 pb-2 text-xs text-blue-200 leading-relaxed">
														{obl.content}
													</p>
												)}
												{i < PLD_OBLIGATIONS.length - 1 && (
													<div className="border-b border-white/10" />
												)}
											</div>
										))}
									</div>
								</div>

								{/* Certified Persons PDF */}
								<div
									className="mt-8 animate-slide-in hover-lift flex flex-col sm:flex-row sm:items-center gap-4 rounded-md border border-white/10 bg-white/[0.03] px-4 py-4 transition-colors hover:border-white/20"
									style={{ animationDelay: "0.8s" }}
								>
									<FileText
										className="h-5 w-5 shrink-0 text-blue-300"
										aria-hidden="true"
									/>
									<div className="flex-1 min-w-0">
										<h4 className="text-sm font-semibold text-white">
											Lista de Personas Certificadas en PLD/FT
										</h4>
										<p className="mt-0.5 text-xs text-blue-300">
											Listado oficial del Gobierno de México. Actualizado nov.
											2025.
										</p>
									</div>
									<Button
										asChild
										size="sm"
										className="bg-white text-[#0a0e2a] hover:bg-blue-50 gap-1.5 font-semibold shrink-0"
									>
										<a
											href="https://www.gob.mx/cms/uploads/attachment/file/1043151/CertPLDFT-ListaCertificados-20251119.pdf"
											target="_blank"
											rel="noopener noreferrer"
										>
											<Download className="h-3.5 w-3.5" aria-hidden="true" />
											Ver PDF
										</a>
									</Button>
								</div>
							</div>

							{/* Footer */}
							<footer className="mt-10 border-t border-white/10 bg-[#080c22] px-8 py-6 sm:px-10">
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
									<div className="flex items-center gap-3">
										<Image
											src="/janovix-logo.svg"
											alt="JANOVIX"
											width={70}
											height={11}
											className="shrink-0"
										/>
										<div className="h-4 w-px bg-white/20" aria-hidden="true" />
										<Image
											src="/bunker-logo.svg"
											alt="Tax & Compliance"
											width={80}
											height={30}
											className="shrink-0 brightness-0 invert"
										/>
									</div>
									<div className="flex items-center gap-3">
										<Button
											asChild
											size="sm"
											variant="outline"
											className="border-white/20 text-white hover:bg-white/10 gap-1.5 bg-transparent text-xs h-8"
										>
											<a
												href="https://www.bunkerfiscal.com/"
												target="_blank"
												rel="noopener noreferrer"
											>
												bunkerfiscal.com
												<ExternalLink className="h-3 w-3" aria-hidden="true" />
											</a>
										</Button>
									</div>
								</div>
								<p className="mt-3 text-xs font-medium text-blue-200">
									Acceso preferencial para clientes Enterprise de JANOVIX.
								</p>
								<p className="mt-2 text-[10px] text-blue-300 leading-relaxed">
									Todas las consultas son tratadas con absoluta
									confidencialidad. La información proporcionada no constituye
									asesoría legal formal. Para una consulta personalizada,
									contacte directamente a Tax &amp; Compliance.
								</p>
							</footer>
						</div>
					</ScrollArea>
				</DialogContent>
			</Dialog>
		</>
	);
}
