/* Tutorial wording and worked methods adapted from the supplied Set 2 PDFs. */
window.TutorialContent = (() => {
  const f=(key,label,step,min,max,tex='',unit='')=>({key,label,step,min,max,tex,unit});
  const r=(label,value,unit='',tex='',fallback='')=>({label,value,unit,tex,fallback});
  const m=(tex,fallback)=>({tex,fallback});
  const t=text=>({text});
  const x=(tex,fallback)=>`<span data-tex="${tex.replace(/&/g,'&amp;').replace(/"/g,'&quot;')}">${fallback}</span>`;
  const n=x=>Number.isFinite(x)?Number(x.toPrecision(6)).toString(): '∞';
  return {
    q1: {
      short:'Bids',title:'Contractor bids',lecture:'Lecture notes 4',intro:'',
      formula:m(String.raw`X=I_A+I_B+I_C`, 'X = I_A + I_B + I_C'),
      question:`Three independent bids have win probabilities ${x(String.raw`P(A)=0.5,\ P(B)=0.8,\ P(C)=0.2`,'P(A) = 0.5, P(B) = 0.8, P(C) = 0.2')}. Let ${x(String.raw`X`,'X')} count the wins.`,
      tasks:[`(a) Find the values of ${x(String.raw`X`,'X')}. Compute and plot its PMF.`,`(b) Plot the CDF.`,`(c) Find ${x(String.raw`P(X\le2)`,'P(X ≤ 2)')}.`,`(d) Find ${x(String.raw`P(0<X\le2)`,'P(0 < X ≤ 2)')}.`],
      fields:[f('a','Win A',.05,0,1,String.raw`P(A)`),f('b','Win B',.05,0,1,String.raw`P(B)`),f('c','Win C',.05,0,1,String.raw`P(C)`)],
      results:(v,o)=>[r('(a) Values','0, 1, 2, 3','',String.raw`X`,"X"),...o.pmf.map((p,i)=>r('PMF',n(p),'',String.raw`P(X=${i})`,`P(X = ${i})`)),r('(c) Probability',n(o.le2),'',String.raw`P(X\le2)`,"P(X ≤ 2)"),r('(d) Probability',n(o.between),'',String.raw`P(0<X\le2)`,"P(0 < X ≤ 2)")],
      working:(v,o)=>[t('Each indicator is 1 for a win and 0 otherwise.'),t('Multiply independent probabilities and add disjoint outcomes.'),m(String.raw`p_0=(1-p_A)(1-p_B)(1-p_C)`, 'p₀ = (1−pA)(1−pB)(1−pC)'),m(String.raw`p_1=p_A(1-p_B)(1-p_C)+(1-p_A)p_B(1-p_C)+(1-p_A)(1-p_B)p_C`, 'p₁ = P(A only) + P(B only) + P(C only)'),m(String.raw`p_2=p_Ap_B(1-p_C)+p_A(1-p_B)p_C+(1-p_A)p_Bp_C`, 'p₂ = P(A and B only) + P(A and C only) + P(B and C only)'),m(String.raw`p_3=p_Ap_Bp_C`, 'p₃ = pA pB pC'),m(String.raw`F_X(x)=\sum_{k\le x}p_k`, 'F(x) = sum of PMF values at or below x'),m(String.raw`P(0<X\le2)=F_X(2)-F_X(0)`, 'P(0 < X ≤ 2) = F(2) − F(0)')],
    },
    q2:{
      short:'PDF & CDF',title:'Density & moments',lecture:'Lecture notes 4',intro:'',
      formulaInQuestion:true,
      formula:m(String.raw`f_R(r)=c(r-a)(b-r),\quad a\le r\le b`, 'fR(r) = c(r−a)(b−r), a ≤ r ≤ b'),
      question:`The density is zero outside ${x(String.raw`[a,b]`,'[a, b]')}, where ${x(String.raw`a=10,\ b=20`,'a = 10, b = 20')}.`,
      tasks:[`(a) Find ${x(String.raw`c`,'c')}.`,'(b) Derive the full CDF.','(c) Find the mean, median, mode, standard deviation, COV and skewness.'],
      fields:[f('lo','Lower bound',1,0,1000,String.raw`a`),f('hi','Upper bound',1,.1,1000,String.raw`b`),f('r','CDF cutoff',.5,-1000,2000,String.raw`r`)],
      results:(v,o)=>[r('(a) Constant',n(o.c),'',String.raw`c`,"c"),r('CDF at cutoff',n(o.cdf),'',String.raw`F_R(r)`,"F_R(r)"),r('(c.i–iii) Mean / median / mode',n(o.mean),'',String.raw`\mu`,"μ"),r('Variance',n(o.variance),'',String.raw`\sigma^2`,"σ²"),r('(c.iv) SD',n(o.sd),'',String.raw`\sigma`,"σ"),r('(c.v) COV',n(o.cov),'',String.raw`\delta`,"δ"),r('(c.vi) Skewness',n(o.skewness),'',String.raw`\gamma_1`,"γ₁")],
      working:(v,o)=>[m(String.raw`1=c\int_a^b(r-a)(b-r)\,dr=c\frac{(b-a)^3}{6}`, '1 = c ∫ₐᵇ (r−a)(b−r) dr = c(b−a)³/6'),m(String.raw`c=\frac{6}{(b-a)^3},\quad u=\frac{r-a}{b-a}`, 'c = 6/(b−a)³, u = (r−a)/(b−a)'),m(String.raw`F_R(r)=\begin{cases}0&r<a\\3u^2-2u^3&a\le r\le b\\1&r>b\end{cases}`, 'F(r) = 0 below a, 3u²−2u³ on [a,b], 1 above b'),m(String.raw`\mu=\text{median}=\text{mode}=\frac{a+b}{2}`, 'Mean = median = mode = (a+b)/2'),m(String.raw`\operatorname{Var}(R)=\frac{(b-a)^2}{20},\quad \delta=\frac{\sigma}{\mu}`, 'Variance = (b−a)²/20, COV = SD/mean'),t('Symmetry gives zero skewness.'),m(String.raw`\text{Original:}\quad E[R^2]=230,\quad\sigma=\sqrt5\approx2.23607`, 'Original bounds: E[R²] = 230, SD = √5 ≈ 2.23607'),t('The solution PDF’s SD of 2.238 is a typo.')],
    },
    q3:{
      short:'Air traffic',title:'Airport capacity',lecture:'Lecture notes 5',intro:'',
      formula:m(String.raw`T_t\sim N(\mu_t,\sigma_t),\quad\mu_t=\mu_0(1+gt)`, 'Tₜ ~ N(μₜ, σₜ), μₜ = μ₀(1+gt)'),
      question:'Peak-hour traffic is normally distributed with mean 200 and SD 60 planes/hr. Capacity is 350 planes/hr. Assume one peak hour daily. Mean traffic increases by 10% of today’s mean each year, with constant COV.',
      tasks:['(a) Find today’s daily congestion probability.','(b) Find the probability in 10 years without expansion.','(c) Find the future capacity that preserves today’s probability.'],
      fields:[f('mean','Current mean',10,1,10000,String.raw`\mu_0`,'planes/hr'),f('sd','Current SD',5,.1,10000,String.raw`\sigma_0`,'planes/hr'),f('capacity','Capacity',10,1,20000,String.raw`C_0`,'planes/hr'),f('growth','Annual growth',.01,0,1,String.raw`g`),f('years','Years ahead',1,0,100,String.raw`t`,'yr')],
      results:(v,o)=>[r('(a) Congestion now',n(o.currentRisk),'',String.raw`P(T_0>C_0)`,"P(T₀ > C₀)"),r('Future mean',n(o.futureMean),'planes/hr',String.raw`\mu_t`,"μₜ"),r('Future SD',n(o.futureSD),'planes/hr',String.raw`\sigma_t`,"σₜ"),r('(b) Future congestion',n(o.futureRisk),'',String.raw`P(T_t>C_0)`,"P(Tₜ > C₀)"),r('(c) Required capacity',n(o.requiredCapacity),'planes/hr',String.raw`C_t`,"Cₜ")],
      working:(v,o)=>[t('Normal-distribution notation uses mean and SD.'),m(String.raw`P(T>C)=1-\Phi\!\left(\frac{C-\mu_0}{\sigma_0}\right)`, 'Congestion = 1 − Φ((capacity−mean)/SD)'),m(String.raw`\mu_t=\mu_0(1+gt),\quad \sigma_t=\frac{\sigma_0}{\mu_0}\mu_t`, 'Future mean = μ₀(1+gt), future SD = current COV × future mean'),m(String.raw`C_t=\mu_t+\frac{C_0-\mu_0}{\sigma_0}\sigma_t`, 'Required capacity = future mean + current z-score × future SD'),m(String.raw`\text{Original:}\quad z_0=2.5,\quad C_{10}=700\text{ planes/hr}`, 'Original values: z₀ = 2.5, C₁₀ = 700 planes/hr'),t('Original inputs: full precision gives 0.661539. The PDF’s rounded z-score gives 0.6628.')],
    },
    q4:{
      short:'Storm sewers',title:'Annual flood risk',lecture:'Lecture notes 5',intro:'',
      formula:m(String.raw`P(F\mid N=n)=1-(1-p)^n`, 'P(F | N = n) = 1−(1−p)ⁿ'),
      question:`Annual storm counts have ${x(String.raw`P(N=0,1,2,3)=(0.3,0.4,0.2,0.1)`,'P(N = 0, 1, 2, 3) = (0.3, 0.4, 0.2, 0.1)')}. Independent maximum storm runoff is lognormal, with median 7 cfs and COV 0.15. Sewer capacity is 8 cfs.`,
      tasks:['(a) Find the mean and variance of annual storm count.','(b) Find flood probability per storm.','(c) Find the probability of at least one flood per year.'],
      fields:[f('p0','0 storms',.05,0,1,String.raw`P(N=0)`),f('p1','1 storm',.05,0,1,String.raw`P(N=1)`),f('p2','2 storms',.05,0,1,String.raw`P(N=2)`),f('p3','3 storms',.05,0,1,String.raw`P(N=3)`),f('median','Median runoff',.5,.1,1000,String.raw`m_R`,'cfs'),f('cov','Runoff COV',.01,.001,3,String.raw`\delta_R`),f('capacity','Sewer capacity',.5,.1,2000,String.raw`C`,'cfs')],
      results:(v,o)=>[r('(a) Mean storms',n(o.meanN),'storms/year',String.raw`E[N]`,"E[N]"),r('(a) Variance',n(o.varN),'',String.raw`\operatorname{Var}(N)`,"Var(N)"),r('Log SD',n(o.zeta),'',String.raw`\zeta`,"ζ"),r('(b) Per-storm flood',n(o.stormRisk),'',String.raw`p=P(R>C)`,"p = P(R > C)"),r('(c) Annual flood',n(o.annualRisk),'',String.raw`P(F)`,"P(F)")],
      working:(v,o)=>[t('Runoff is independent of storm count.'),m(String.raw`E[N]=\sum_{n=0}^{3}np_n,\quad \operatorname{Var}(N)=\sum_{n=0}^{3}n^2p_n-E[N]^2`, 'E[N] = Σ npₙ, Var(N) = Σ n²pₙ − E[N]²'),m(String.raw`\lambda=\ln(\text{median}),\quad \zeta=\sqrt{\ln(1+\delta^2)}`, 'Log mean λ = ln(median), log SD ζ = √ln(1+COV²)'),m(String.raw`p=P(R>C)=1-\Phi\!\left(\frac{\ln C-\lambda}{\zeta}\right)`, 'Per-storm flood risk p = 1 − Φ((ln C−λ)/ζ)'),m(String.raw`P(F\mid N=n)=1-(1-p)^n`, 'Given n storms, annual flood risk = 1 − (1−p)ⁿ'),m(String.raw`P(F)=1-\sum_{n=0}^{3}p_n(1-p)^n`, 'Annual flood risk = 1 − Σ pₙ(1−p)ⁿ'),t('With no storms, there is no flood.'),t('Original inputs: full precision gives 0.185344 per storm and 0.187339 annually. The PDF approximates log SD by COV and rounds normal tables, giving 0.1867 and 0.189.')],
    },
    q5:{
      short:'Fuel stations',title:'Stations & fuel range',lecture:'Lecture notes 6',intro:'',
      formula:m(String.raw`N(d)\sim\operatorname{Poisson}(\lambda d)`, 'N(d) ~ Poisson(λd)'),
      question:'Stations form a Poisson process at one per 10 miles. Each independently has no gasoline with probability 0.2. The driver has 15 miles of range.',
      tasks:['(a) Find the probability of at most one station within range.','(b) Find the probability that the next three stations have no gasoline.','(c) Find the probability of being stranded before finding gasoline.'],
      fields:[f('rate','Station rate',.01,0,10,String.raw`\lambda`,'stations/mile'),f('distance','Range',1,0,1000,String.raw`d`,'miles'),f('empty','No-gas probability',.05,0,1,String.raw`q`),f('stations','Stations in (b)',1,0,100,String.raw`k`)],
      results:(v,o)=>[r('Expected stations',n(o.mu),'',String.raw`\lambda d`,"λd"),r('(a) At most one',n(o.atMostOne),'',String.raw`P(N\le1)`,"P(N ≤ 1)"),r('(b) All empty',n(o.noGas),'',String.raw`q^k`,"qᵏ"),r('(c) Stranded',n(o.stranded),'',String.raw`P(\text{stranded})`,"P(stranded)")],
      working:(v,o)=>[m(String.raw`N\sim\operatorname{Poisson}(\lambda d),\quad P(N\le1)=e^{-\lambda d}(1+\lambda d)`, 'N ~ Poisson(λd), P(N≤1) = exp(−λd)(1+λd)'),m(String.raw`P(\text{no gas at next }k\text{ stations})=q^k`, 'No gas at k independent stations: qᵏ'),m(String.raw`P(\text{stranded})=\sum_{n=0}^{\infty}q^n e^{-\lambda d}\frac{(\lambda d)^n}{n!}`, 'P(stranded) = Σ qⁿ exp(−λd)(λd)ⁿ/n!'),m(String.raw`=e^{-\lambda d}e^{q\lambda d}=e^{-\lambda d(1-q)}`, '= exp(−λd) exp(qλd) = exp(−λd(1−q))'),t('Stranding means zero stations with gasoline within range.')],
    },
    q6:{
      short:'Canal lock',title:'Lock cycle & waiting',lecture:'Lecture notes 6',intro:'',
      formula:m(String.raw`P(T>t_d)=e^{-\lambda t_d}=s`, 'P(T > t_d) = exp(−λt_d) = s'),
      question:'Interarrival times are exponential with mean 0.5 hr. Design for 80% of boats to avoid waiting. Shorter cycles cost more. Town A sends one boat every six hours: four per day.',
      tasks:['(a) Find the design cycle time.','(b.i) Find the probability that none of four boats waits.','(b.ii) Find the probability that at least two boats wait.'],
      fields:[f('mean','Mean interarrival',.1,.001,24,String.raw`E[T]`,'hr'),f('service','No-wait target',.05,.001,1,String.raw`s`),f('boats','Boats per day',1,1,100,String.raw`n`)],
      results:(v,o)=>[r('Arrival rate',n(o.rate),'boats/hr',String.raw`\lambda`,"λ"),r('(a) Maximum cycle',n(o.cycleHours),'hr',String.raw`t_d`,"t_d"),r('Cycle in minutes',n(o.cycleMinutes),'min',String.raw`60t_d`,"60t_d"),r('(b.i) None wait',n(o.noneWait),'',String.raw`P(X=0)`,"P(X = 0)"),r('(b.ii) At least two wait',n(o.atLeastTwo),'',String.raw`P(X\ge2)`,"P(X ≥ 2)")],
      working:(v,o)=>[t('No wait means the interarrival time exceeds the cycle time. Boat outcomes are independent.'),m(String.raw`\lambda=\frac{1}{E[T]},\quad P(T>t_d)=e^{-\lambda t_d}=s`, 'λ = 1/E[T], no-wait probability = exp(−λtᵈ) = s'),m(String.raw`t_d=-\frac{\ln s}{\lambda}`, 'Design cycle tᵈ = −ln(s)/λ'),t('Choose the longest cycle that meets the target.'),m(String.raw`X\sim\operatorname{Binomial}(n,1-s)`, 'Number of boats waiting X ~ Binomial(n, 1−s)'),m(String.raw`P(X=0)=s^n`, 'P(no boats wait) = sⁿ'),m(String.raw`P(X\ge2)=1-s^n-n(1-s)s^{n-1}`, 'P(at least two wait) = 1 − sⁿ − n(1−s)sⁿ⁻¹')],
    },
    q7:{
      short:'Drag force',title:'Velocity to drag force',lecture:'Lecture notes 7',intro:'',
      formulaInQuestion:true,
      formula:m(String.raw`Y=\tfrac12 C_D\rho AV^2`, 'Y = ½ C_DρAV²'),
      question:`Velocity ${x(String.raw`V`,'V')} is exponential with mean ${x(String.raw`v_0`,'v₀')}: ${x(String.raw`f_V(v)=e^{-v/v_0}/v_0,\ v\ge0`,'fV(v) = exp(−v/v₀)/v₀, v ≥ 0')}, zero otherwise. Drag coefficient ${x(String.raw`C_D`,'C_D')}, fluid density ${x(String.raw`\rho`,'ρ')} and area ${x(String.raw`A`,'A')} are positive constants.`,
      tasks:[`Derive ${x(String.raw`f_Y(y)`,'fY(y)')}.`],
      fields:[f('cd','Drag coefficient',.1,.001,10,String.raw`C_D`),f('rho','Fluid density',10,.001,100000,String.raw`\rho`,'kg/m³'),f('area','Area',.1,.001,1000,String.raw`A`,'m²'),f('v0','Mean velocity',.5,.001,1000,String.raw`v_0`,'m/s'),f('y','Force cutoff',100,0,100000000,String.raw`y`,'N')],
      results:(v,o)=>[r('Force coefficient',n(o.k),'',String.raw`C=\tfrac12 C_D\rho A`,"C = ½ C_DρA"),r('Equivalent velocity',n(o.velocity),'m/s',String.raw`\sqrt{y/C}`,"√(y/C)"),r('Density',n(o.pdf),'N⁻¹',String.raw`f_Y(y)`,"f_Y(y)"),r('CDF',n(o.cdf),'',String.raw`F_Y(y)`,"F_Y(y)"),r('Mean force (extension)',n(o.meanY),'N',String.raw`E[Y]`,"E[Y]")],
      working:(v,o)=>[m(String.raw`C=\tfrac12 C_D\rho A>0,\quad v=\sqrt{y/C}`, 'C = ½ CDρA > 0, inverse v = √(y/C)'),m(String.raw`\left|\frac{dv}{dy}\right|=\frac{1}{2\sqrt{Cy}}`, 'Jacobian |dv/dy| = 1/(2√(Cy))'),m(String.raw`f_Y(y)=\frac{\exp(-\sqrt{y/C}/v_0)}{2v_0\sqrt{Cy}},\quad y>0`, 'fY(y) = exp(−√(y/C)/v₀)/(2v₀√(Cy)), for y > 0'),m(String.raw`f_Y(y)=0\ (y<0),\quad P(Y=0)=0`, 'Density is zero for y < 0, P(Y = 0) = 0'),t('The density diverges near zero but has a finite integral.'),m(String.raw`F_Y(y)=\begin{cases}0&y<0\\1-e^{-\sqrt{y/C}/v_0}&y\ge0\end{cases}`, 'FY(y) = 0 for y < 0, 1−exp(−√(y/C)/v₀) for y ≥ 0'),m(String.raw`E[Y]=CE[V^2]=2Cv_0^2`, 'Mean drag = C E[V²] = 2Cv₀²')],
    },
    q8:{
      short:'Beam reliability',title:'Beam failure',lecture:'Lecture notes 7',intro:'',
      formulaInQuestion:true,
      formula:m(String.raw`M=50W+10P`, 'M = 50W + 10P'),
      question:`A 10 ft cantilever carries a uniform load ${x(String.raw`W\sim N(1,0.2)`,'W ~ N(1, 0.2)')} kips/ft and a tip load ${x(String.raw`P\sim N(5,1)`,'P ~ N(5, 1)')} kips, with ${x(String.raw`\rho_{W,P}=0.5`,'ρW,P = 0.5')}. Resistance ${x(String.raw`R\sim N(200,50)`,'R ~ N(200, 50)')} ft-kips is independent of the loads.`,
      tasks:[`(a) Find ${x(String.raw`E[M]`,'E[M]')} and ${x(String.raw`\operatorname{Var}(M)`,'Var(M)')}.`,`(b) Find failure probability ${x(String.raw`P(R<M)`,'P(R < M)')}.`],
      fields:[f('meanW','Mean load W',.1,0,100,String.raw`\mu_W`,'kips/ft'),f('sdW','SD load W',.05,0,100,String.raw`\sigma_W`,'kips/ft'),f('meanP','Mean load P',.5,0,1000,String.raw`\mu_P`,'kips'),f('sdP','SD load P',.1,0,1000,String.raw`\sigma_P`,'kips'),f('corr','Load correlation',.1,-1,1,String.raw`\rho_{W,P}`),f('meanR','Mean resistance',10,0,100000,String.raw`\mu_R`,'ft-kips'),f('sdR','SD resistance',5,.01,100000,String.raw`\sigma_R`,'ft-kips')],
      results:(v,o)=>[r('(a) Mean moment',n(o.meanM),'ft-kips',String.raw`\mu_M`,"μ_M"),r('(a) Moment variance',n(o.varM),'(ft-kips)²',String.raw`\sigma_M^2`,"σ_M²"),r('Moment SD',n(o.sdM),'ft-kips',String.raw`\sigma_M`,"σ_M"),r('Mean safety margin',n(o.meanMargin),'ft-kips',String.raw`\mu_G`,"μ_G"),r('Safety margin SD',n(o.sdMargin),'ft-kips',String.raw`\sigma_G`,"σ_G"),r('(b) Failure',n(o.failureRisk),'',String.raw`P(R<M)`,"P(R < M)")],
      working:(v,o)=>[t('Loads are jointly normal. Normal-distribution notation uses mean and SD.'),m(String.raw`E[M]=50\mu_W+10\mu_P`, 'E[M] = 50μW + 10μP'),m(String.raw`\operatorname{Var}(M)=50^2\sigma_W^2+10^2\sigma_P^2+2(50)(10)\rho\sigma_W\sigma_P`, 'Var(M) = 50²σW² + 10²σP² + 2×50×10×ρσWσP'),t('Correlation affects variance only.'),m(String.raw`G=R-M,\quad \mu_G=\mu_R-\mu_M`, 'Safety margin G = R−M, mean = μR−μM'),m(String.raw`\sigma_G^2=\sigma_R^2+\sigma_M^2`, 'Independence gives Var(G) = Var(R) + Var(M)'),m(String.raw`P_f=P(G<0)=\Phi\!\left(-\frac{\mu_G}{\sigma_G}\right)`, 'Failure probability = Φ(−mean margin / SD of margin)')],
    },
    q9:{
      short:'Column design',title:'Column sizing',lecture:'Lecture notes 7',intro:'',
      formulaInQuestion:true,
      formula:m(String.raw`S=W/A`, 'S = W/A'),
      question:`Lognormal load ${x(String.raw`W`,'W')} has mean 3000 kN and COV 0.2. Strength ${x(String.raw`R`,'R')} has mean 35,000 kN/m² and COV 0.2. Area ${x(String.raw`A`,'A')} is constant. Choose a convenient strength distribution.`,
      tasks:['(a) Identify the stress distribution.',`(b) Find crushing probability for a ${x(String.raw`0.4\text{ m}\times0.4\text{ m}`,'0.4 m × 0.4 m')} column.`,`(c) Find the area required for ${x(String.raw`P_f\le10^{-3}`,'Pf ≤ 10⁻³')}.`],
      fields:[f('meanW','Mean load',100,1,1000000,String.raw`\mu_W`,'kN'),f('covW','Load COV',.05,.001,3,String.raw`\delta_W`),f('meanR','Mean strength',1000,1,10000000,String.raw`\mu_R`,'kN/m²'),f('covR','Strength COV',.05,.001,3,String.raw`\delta_R`),f('area','Column area',.01,.0001,100,String.raw`A`,'m²'),f('target','Failure target',.0001,.000001,.49,String.raw`p_{\mathrm{target}}`)],
      results:(v,o)=>[r('(a) Stress','Lognormal','',String.raw`S`,"S"),r('Mean stress',n(o.meanS),'kN/m²',String.raw`\mu_S`,"μ_S"),r('Stress COV',n(o.covS),'',String.raw`\delta_S`,"δ_S"),r('(b) Crushing',n(o.failureRisk),'',String.raw`P_f`,"P_f"),r('(c) Required area',n(o.requiredArea),'m²',String.raw`A_{\min}`,"A_min"),r('Square side',n(o.requiredSide),'m',String.raw`\sqrt{A_{\min}}`,"√A_min"),r('Meets target',o.failureRisk<=v.target?'Yes':'No')],
      working:(v,o)=>[t('Assume independent lognormal strength and load.'),m(String.raw`\mu_S=\frac{\mu_W}{A},\quad \delta_S=\delta_W`, 'Stress mean = mean load / area, stress COV = load COV'),m(String.raw`\zeta_i^2=\ln(1+\delta_i^2),\quad \lambda_i=\ln\mu_i-\tfrac12\zeta_i^2`, 'For a lognormal variable: log variance = ln(1+COV²), log mean = ln(mean) − ½ log variance'),m(String.raw`Z=\ln(R/S)\sim N\!\left(\lambda_R-\lambda_S,\sqrt{\zeta_R^2+\zeta_S^2}\right)`, 'ln(R/S) is normal with mean λR−λS and SD √(ζR²+ζS²)'),m(String.raw`P_f=P(Z<0)=\Phi\!\left(\frac{\lambda_S-\lambda_R}{\sqrt{\zeta_R^2+\zeta_S^2}}\right)`, 'Crushing probability = Φ((λS−λR)/√(ζR²+ζS²))'),m(String.raw`A_{\min}=\exp\!\left[\lambda_W-\lambda_R-\Phi^{-1}(p_{\mathrm{target}})\sqrt{\zeta_R^2+\zeta_W^2}\right]`, 'Required area = exp[λW−λR−Φ⁻¹(target)√(ζR²+ζW²)]'),m(String.raw`\text{Original:}\quad A_{\min}=0.203672\text{ m}^2,\quad\sqrt{A_{\min}}=0.451301\text{ m}`, 'Original result: minimum area = 0.203672 m², square side = 0.451301 m'),t('Round practical dimensions upward.')],
    }
  };
})();
