/* Tutorial wording and worked methods adapted from the supplied Set 2 PDFs. */
window.TutorialContent = (() => {
  const f=(key,label,step,min,max)=>({key,label,step,min,max});
  const r=(label,value,unit='')=>({label,value,unit});
  const m=(tex,fallback)=>({tex,fallback});
  const t=text=>({text});
  const n=x=>Number.isFinite(x)?Number(x.toPrecision(6)).toString(): '∞';
  return {
    q1: {
      short:'Bids',title:'Contractor bids & discrete distributions',lecture:'Lecture notes 4',
      intro:'A contractor bids for three independent jobs. Let X be the number of jobs won.',
      question:'The probabilities of winning jobs A, B and C are 0.5, 0.8 and 0.2. Assume the three events are statistically independent.',
      tasks:['(a) Find the possible values of X, and compute and plot its PMF.','(b) Plot the cumulative distribution function of X.','(c) Determine P(X ≤ 2).','(d) Determine P(0 < X ≤ 2).'],
      fields:[f('a','P(A)',.05,0,1),f('b','P(B)',.05,0,1),f('c','P(C)',.05,0,1)],
      note:'The three probabilities can differ, so X is not generally a binomial random variable.',
      results:(v,o)=>[r('(a) Possible values','0, 1, 2, 3'),...o.pmf.map((p,i)=>r(`P(X = ${i})`,n(p))),r('(c) P(X ≤ 2)',n(o.le2)),r('(d) P(0 < X ≤ 2)',n(o.between))],
      working:(v,o)=>[t('Enumerate the eight win/loss outcomes and multiply independent probabilities. Group outcomes by the number of wins.'),m(String.raw`p_0=(1-p_A)(1-p_B)(1-p_C)`, 'p₀ = (1−pA)(1−pB)(1−pC)'),m(String.raw`p_1=p_A(1-p_B)(1-p_C)+(1-p_A)p_B(1-p_C)+(1-p_A)(1-p_B)p_C`, 'p₁ = P(A only) + P(B only) + P(C only)'),m(String.raw`p_2=p_Ap_B(1-p_C)+p_A(1-p_B)p_C+(1-p_A)p_Bp_C`, 'p₂ = P(A and B only) + P(A and C only) + P(B and C only)'),m(String.raw`p_3=p_Ap_Bp_C`, 'p₃ = pA pB pC'),m(String.raw`F_X(x)=\sum_{k\le x}p_k`, 'F(x) = sum of PMF values at or below x'),m(String.raw`P(0<X\le2)=F_X(2)-F_X(0)`, 'P(0 < X ≤ 2) = F(2) − F(0)')],
      checks:[{label:'(c) P(X ≤ 2)',key:'le2'},{label:'(d) P(0 < X ≤ 2)',key:'between'}],
      hints:['Start with X = 0: all three bids must be unsuccessful.','For exactly one win there are three disjoint outcomes. Add their probabilities.','The CDF includes the probability at the endpoint: P(0 < X ≤ 2) excludes X = 0.']
    },
    q2:{
      short:'PDF & CDF',title:'A continuous density & its moments',lecture:'Lecture notes 4',
      intro:'Explore fR(r) = c(r − 10)(20 − r), for 10 ≤ r ≤ 20; zero elsewhere.',
      question:'The PDF is fR(r) = c(r − 10)(20 − r) on [10, 20]. The constant c makes the total area equal to one. The editable bounds below extend the same density to [a, b].',
      tasks:['(a) Find c.','(b) Derive the full cumulative distribution function.','(c) Find the mean, median, mode, standard deviation, coefficient of variation and skewness coefficient.'],
      fields:[f('lo','Lower bound a',1,0,1000),f('hi','Upper bound b',1,.1,1000),f('r','CDF cutoff r',.5,-1000,2000)],
      note:'Move the cutoff to connect area under the PDF with height on the CDF.',
      results:(v,o)=>[r('(a) Normalizing constant c',n(o.c)),r('F(r) at the selected cutoff',n(o.cdf)),r('(c.i–iii) Mean / median / mode',n(o.mean)),r('Variance',n(o.variance)),r('(c.iv) Standard deviation',n(o.sd)),r('(c.v) COV',n(o.cov)),r('(c.vi) Skewness',n(o.skewness))],
      working:(v,o)=>[m(String.raw`1=c\int_a^b(r-a)(b-r)\,dr=c\frac{(b-a)^3}{6}`, '1 = c ∫ₐᵇ (r−a)(b−r) dr = c(b−a)³/6'),m(String.raw`c=\frac{6}{(b-a)^3},\quad u=\frac{r-a}{b-a}`, 'c = 6/(b−a)³; u = (r−a)/(b−a)'),m(String.raw`F_R(r)=\begin{cases}0&r<a\\3u^2-2u^3&a\le r\le b\\1&r>b\end{cases}`, 'F(r) = 0 below a; 3u²−2u³ on [a,b]; 1 above b'),m(String.raw`\mu=\text{median}=\text{mode}=\frac{a+b}{2}`, 'Mean = median = mode = (a+b)/2'),m(String.raw`\operatorname{Var}(R)=\frac{(b-a)^2}{20},\quad \delta=\frac{\sigma}{\mu}`, 'Variance = (b−a)²/20; COV = SD/mean'),t('Symmetry about the mean gives zero third central moment and zero skewness.'),t('For the original bounds: E[R²] = 230 and σ = √5 = 2.23607. The solution PDF’s 2.238 is a numerical typo.')],
      checks:[{label:'(a) Normalizing constant c',key:'c'},{label:'(c.iv) Standard deviation',key:'sd'},{label:'CDF at the selected cutoff',key:'cdf'}],
      hints:['A density has total area one. Integrate first, then solve for c.','Use u = (r−a)/(b−a) to simplify the integral.','The shape is symmetric. Mean, median and mode coincide; variance comes from E[R²] − E[R]².']
    },
    q3:{
      short:'Air traffic',title:'Airport capacity & congestion',lecture:'Lecture notes 5',
      intro:'Peak-hour traffic is normal with mean 200 and standard deviation 60 aircraft per hour.',
      question:'The present runway capacity is 350 aircraft per hour. Assume one peak hour daily. Mean traffic grows linearly by 10% of the current volume per year, while the coefficient of variation stays constant.',
      tasks:['(a) Find the current daily probability of congestion.','(b) Find the probability of congestion in 10 years with no expansion.','(c) Find the capacity needed then to maintain the current congestion probability.'],
      fields:[f('mean','Current mean (planes/hr)',10,1,10000),f('sd','Current SD (planes/hr)',5,.1,10000),f('capacity','Capacity (planes/hr)',10,1,20000),f('growth','Linear growth / year',.01,0,1),f('years','Years ahead',1,0,100)],
      note:'Growth is linear: add the same fraction of today’s mean each year. N(μ, σ) uses standard deviation.',
      results:(v,o)=>[r('(a) Current congestion probability',n(o.currentRisk)),r('Future mean',n(o.futureMean),'planes/hr'),r('Future standard deviation',n(o.futureSD),'planes/hr'),r('(b) Future congestion probability',n(o.futureRisk)),r('(c) Required capacity',n(o.requiredCapacity),'planes/hr')],
      working:(v,o)=>[m(String.raw`P(T>C)=1-\Phi\!\left(\frac{C-\mu_0}{\sigma_0}\right)`, 'Congestion = 1 − Φ((capacity−mean)/SD)'),m(String.raw`\mu_t=\mu_0(1+gt),\quad \sigma_t=\frac{\sigma_0}{\mu_0}\mu_t`, 'Future mean = μ₀(1+gt); future SD = current COV × future mean'),m(String.raw`C_t=\mu_t+\frac{C_0-\mu_0}{\sigma_0}\sigma_t`, 'Required capacity = future mean + current z-score × future SD'),t('At the original values, z₀ = 2.5 and C₁₀ = 700 planes/hr. Keeping the same z-score preserves the tail probability.'),t('Using the full future z = −0.416667 gives 0.661539. The printed solution rounds z to −0.42 and reports 0.6628.')],
      checks:[{label:'(a) Current congestion probability',key:'currentRisk'},{label:'(b) Future congestion probability',key:'futureRisk'},{label:'(c) Required capacity (planes/hr)',key:'requiredCapacity'}],
      hints:['Congestion is the upper tail above capacity. Standardize with z = (C−μ)/σ.','A constant COV means standard deviation grows in the same proportion as the mean.','To maintain the service level, preserve the current z-score.']
    },
    q4:{
      short:'Storm sewers',title:'Rainstorms & annual flood risk',lecture:'Lecture notes 5',
      intro:'Separate flooding in one storm from flooding at least once in a year.',
      question:'The annual number of storms has P(N=0,1,2,3) = 0.3, 0.4, 0.2, 0.1. Maximum runoff in each storm is lognormal with median 7 cfs and COV 0.15. The proposed sewer can handle runoff below 8 cfs. Storm runoff rates are independent.',
      tasks:['(a) Find the mean and variance of the number of storms per year.','(b) Find the probability of flooding during one storm.','(c) Find the probability of at least one flood in a year.'],
      fields:[f('p0','P(N = 0)',.05,0,1),f('p1','P(N = 1)',.05,0,1),f('p2','P(N = 2)',.05,0,1),f('p3','P(N = 3)',.05,0,1),f('median','Median runoff (cfs)',.5,.1,1000),f('cov','Runoff COV',.01,.001,3),f('capacity','Sewer capacity (cfs)',.5,.1,2000)],
      note:'The four storm-count probabilities must sum to 1. Here 7 cfs is the median, not the mean.',
      results:(v,o)=>[r('(a) Mean storm count',n(o.meanN),'storms/year'),r('(a) Variance of storm count',n(o.varN)),r('Log-space standard deviation ζ',n(o.zeta)),r('(b) Flood probability per storm',n(o.stormRisk)),r('(c) Annual flood probability',n(o.annualRisk))],
      working:(v,o)=>[m(String.raw`E[N]=\sum_{n=0}^{3}np_n,\quad \operatorname{Var}(N)=\sum_{n=0}^{3}n^2p_n-E[N]^2`, 'E[N] = Σ npₙ; Var(N) = Σ n²pₙ − E[N]²'),m(String.raw`\lambda=\ln(\text{median}),\quad \zeta=\sqrt{\ln(1+\delta^2)}`, 'Log mean λ = ln(median); log SD ζ = √ln(1+COV²)'),m(String.raw`p=P(R>C)=1-\Phi\!\left(\frac{\ln C-\lambda}{\zeta}\right)`, 'Per-storm flood risk p = 1 − Φ((ln C−λ)/ζ)'),m(String.raw`P(F\mid N=n)=1-(1-p)^n`, 'Given n storms, annual flood risk = 1 − (1−p)ⁿ'),m(String.raw`P(F)=1-\sum_{n=0}^{3}p_n(1-p)^n`, 'Annual flood risk = 1 − Σ pₙ(1−p)ⁿ'),t('The model uses the same runoff distribution conditional on the storm count. With zero storms there can be no flood.'),t('At the original tutorial values, full lognormal precision gives 0.185344 per storm and 0.187339 annually. The PDF uses ζ ≈ COV and rounded normal tables, giving approximately 0.1867 and 0.189.')],
      checks:[{label:'(a) Mean storm count',key:'meanN'},{label:'(a) Variance of storm count',key:'varN'},{label:'(b) Flood probability per storm',key:'stormRisk'},{label:'(c) Annual flood probability',key:'annualRisk'}],
      hints:['Read the PMF carefully: the probabilities for 0, 1, 2, 3 storms are 0.3, 0.4, 0.2, 0.1.','For a lognormal variable, ln R is normal; its mean is ln(median).','Condition on the number of storms and work with no flooding first.']
    },
    q5:{
      short:'Fuel stations',title:'Poisson stations & running out of fuel',lecture:'Lecture notes 6',
      intro:'Stations occur at a mean rate of one per 10 miles. Each independently has no gasoline with probability 0.2.',
      question:'A driver can travel another 15 miles. Service stations form a Poisson process along the highway, and gasoline availability is independent across stations.',
      tasks:['(a) Find the probability of at most one station in the next 15 miles.','(b) Find the probability that none of the next three stations has gasoline.','(c) Find the probability the driver is stranded before finding gasoline.'],
      fields:[f('rate','Stations per mile',.01,0,10),f('distance','Remaining range (miles)',1,0,1000),f('empty','No-gas probability',.05,0,1),f('stations','Stations in part (b)',1,0,100)],
      note:'Part (b) fixes the number of stations. Part (c) averages over every possible number, including zero.',
      results:(v,o)=>[r('Expected stations in range',n(o.mu)),r('(a) P(N ≤ 1)',n(o.atMostOne)),r('(b) None of the next stations has gas',n(o.noGas)),r('(c) Probability of being stranded',n(o.stranded))],
      working:(v,o)=>[m(String.raw`N\sim\operatorname{Poisson}(\lambda d),\quad P(N\le1)=e^{-\lambda d}(1+\lambda d)`, 'N ~ Poisson(λd); P(N≤1) = exp(−λd)(1+λd)'),m(String.raw`P(\text{no gas at next }k\text{ stations})=q^k`, 'No gas at k independent stations: qᵏ'),m(String.raw`P(\text{stranded})=\sum_{n=0}^{\infty}q^n e^{-\lambda d}\frac{(\lambda d)^n}{n!}`, 'P(stranded) = Σ qⁿ exp(−λd)(λd)ⁿ/n!'),m(String.raw`=e^{-\lambda d}e^{q\lambda d}=e^{-\lambda d(1-q)}`, '= exp(−λd) exp(qλd) = exp(−λd(1−q))'),t('Equivalently, stations with gasoline form a thinned Poisson process with rate λ(1−q). Being stranded means zero such stations within range.')],
      checks:[{label:'(a) P(N ≤ 1)',key:'atMostOne'},{label:'(b) Probability all selected stations are empty',key:'noGas'},{label:'(c) Stranded probability',key:'stranded'}],
      hints:['Convert the station rate to the mean count over the remaining distance.','For a fixed number of stations, multiply independent stockout probabilities.','For stranding, sum over all counts or thin the Poisson process to stations with gasoline.']
    },
    q6:{
      short:'Canal lock',title:'Lock cycle time & waiting',lecture:'Lecture notes 6',
      intro:'Exponential interarrival times have mean 0.5 hr. Design for 80% of incoming boats to pass without waiting.',
      question:'A shorter lock cycle costs more. For design, the tutorial treats a boat as avoiding a wait when its interarrival time exceeds the cycle time. One boat leaves town A every six hours, giving four boats in a 24-hour day.',
      tasks:['(a) Find the required design cycle time.','(b.i) Find the probability that none of the four boats has to wait.','(b.ii) Find the probability that at least two boats have to wait.'],
      fields:[f('mean','Mean interarrival time (hr)',.1,.001,24),f('service','Target no-wait probability',.05,.001,1),f('boats','Boats in one day',1,1,100)],
      note:'Uses the tutorial’s interarrival model and independent waiting outcomes for the daily binomial calculation.',
      results:(v,o)=>[r('Arrival rate',n(o.rate),'boats/hr'),r('(a) Maximum design cycle',n(o.cycleHours),'hr'),r('Cycle in minutes',n(o.cycleMinutes),'min'),r('(b.i) No boats wait',n(o.noneWait)),r('(b.ii) At least two boats wait',n(o.atLeastTwo))],
      working:(v,o)=>[m(String.raw`\lambda=\frac{1}{E[T]},\quad P(T>t_d)=e^{-\lambda t_d}=s`, 'λ = 1/E[T]; no-wait probability = exp(−λtᵈ) = s'),m(String.raw`t_d=-\frac{\ln s}{\lambda}`, 'Design cycle tᵈ = −ln(s)/λ'),t('A shorter cycle gives a higher no-wait probability in this model.'),m(String.raw`X\sim\operatorname{Binomial}(n,1-s)`, 'Number of boats waiting X ~ Binomial(n, 1−s)'),m(String.raw`P(X=0)=s^n`, 'P(no boats wait) = sⁿ'),m(String.raw`P(X\ge2)=1-s^n-n(1-s)s^{n-1}`, 'P(at least two wait) = 1 − sⁿ − n(1−s)sⁿ⁻¹')],
      checks:[{label:'(a) Design cycle (hours)',key:'cycleHours'},{label:'(b.i) No boats wait',key:'noneWait'},{label:'(b.ii) At least two boats wait',key:'atLeastTwo'}],
      hints:['No waiting corresponds to T > cycle time, so use the exponential survival function.','Solve exp(−λt) = 0.8, with λ = 1/0.5 per hour.','For the daily count use Binomial(4, 0.2) and the complement of zero or one waiting.']
    },
    q7:{
      short:'Drag force',title:'Transforming velocity into drag force',lecture:'Lecture notes 7',
      intro:'Y = ½ CDρAV². Velocity V is exponential with mean v₀. Derive the density of Y.',
      question:'CD is the drag coefficient, ρ is fluid density, A is area and V is velocity. The velocity PDF is exp(−v/v₀)/v₀ for v ≥ 0 and zero otherwise. All physical constants are positive.',
      tasks:['Derive the PDF of Y using the monotone transformation Y = CV², where C = ½ CDρA.'],
      fields:[f('cd','Drag coefficient CD',.1,.001,10),f('rho','Fluid density (kg/m³)',10,.001,100000),f('area','Area (m²)',.1,.001,1000),f('v0','Mean velocity (m/s)',.5,.001,1000),f('y','Force cutoff y (N)',100,0,100000000)],
      note:'The PDF gives no numerical constants. These editable SI values are an illustration of the symbolic result.',
      results:(v,o)=>[r('C = ½ CDρA',n(o.k)),r('Equivalent velocity √(y/C)',n(o.velocity),'m/s'),r('Density fY(y)',n(o.pdf),'N⁻¹'),r('Cumulative probability FY(y)',n(o.cdf)),r('Mean drag force (extension)',n(o.meanY),'N')],
      working:(v,o)=>[m(String.raw`C=\tfrac12 C_D\rho A>0,\quad v=\sqrt{y/C}`, 'C = ½ CDρA > 0; inverse v = √(y/C)'),m(String.raw`\left|\frac{dv}{dy}\right|=\frac{1}{2\sqrt{Cy}}`, 'Jacobian |dv/dy| = 1/(2√(Cy))'),m(String.raw`f_Y(y)=\frac{\exp(-\sqrt{y/C}/v_0)}{2v_0\sqrt{Cy}},\quad y>0`, 'fY(y) = exp(−√(y/C)/v₀)/(2v₀√(Cy)), for y > 0'),t('For y < 0 the density is zero. It diverges as y approaches zero from above, but is integrable and P(Y = 0) = 0.'),m(String.raw`F_Y(y)=\begin{cases}0&y<0\\1-e^{-\sqrt{y/C}/v_0}&y\ge0\end{cases}`, 'FY(y) = 0 for y < 0; 1−exp(−√(y/C)/v₀) for y ≥ 0'),m(String.raw`E[Y]=CE[V^2]=2Cv_0^2`, 'Mean drag = C E[V²] = 2Cv₀²')],
      checks:[{label:'Illustration: FY(y) at the selected cutoff',key:'cdf'}],
      hints:['V ≥ 0 makes Y = CV² one-to-one, so only the positive square root is needed.','Multiply fV at the inverse value by |dv/dy|.','Differentiate the transformed CDF to check the PDF. A density can diverge at one point while its total integral remains finite.']
    },
    q8:{
      short:'Beam reliability',title:'Correlated loads & beam failure',lecture:'Lecture notes 7',
      intro:'A 10 ft cantilever carries W ~ N(1, 0.2) kips/ft and P ~ N(5, 1) kips. M = 50W + 10P.',
      question:'The load correlation is ρW,P = 0.5. Resistance R ~ N(200, 50) ft-kips is independent of the applied moment M. The notation N(μ, σ) gives mean and standard deviation.',
      tasks:['(a) Find the mean and variance of the applied bending moment.','(b) Find the beam failure probability P(R < M).'],
      fields:[f('meanW','Mean W (kips/ft)',.1,0,100),f('sdW','SD W (kips/ft)',.05,0,100),f('meanP','Mean P (kips)',.5,0,1000),f('sdP','SD P (kips)',.1,0,1000),f('corr','Correlation ρW,P',.1,-1,1),f('meanR','Mean R (ft-kips)',10,0,100000),f('sdR','SD R (ft-kips)',5,.01,100000)],
      note:'The solution assumes jointly normal W and P, and resistance independent of the loads.',
      results:(v,o)=>[r('(a) Mean M',n(o.meanM),'ft-kips'),r('(a) Variance M',n(o.varM),'(ft-kips)²'),r('SD of M',n(o.sdM),'ft-kips'),r('Mean safety margin R − M',n(o.meanMargin),'ft-kips'),r('SD of safety margin',n(o.sdMargin),'ft-kips'),r('(b) Failure probability',n(o.failureRisk))],
      working:(v,o)=>[m(String.raw`E[M]=50\mu_W+10\mu_P`, 'E[M] = 50μW + 10μP'),m(String.raw`\operatorname{Var}(M)=50^2\sigma_W^2+10^2\sigma_P^2+2(50)(10)\rho\sigma_W\sigma_P`, 'Var(M) = 50²σW² + 10²σP² + 2×50×10×ρσWσP'),t('Correlation changes the moment variance, but not the mean.'),m(String.raw`G=R-M,\quad \mu_G=\mu_R-\mu_M`, 'Safety margin G = R−M; mean = μR−μM'),m(String.raw`\sigma_G^2=\sigma_R^2+\sigma_M^2`, 'Independence gives Var(G) = Var(R) + Var(M)'),m(String.raw`P_f=P(G<0)=\Phi\!\left(-\frac{\mu_G}{\sigma_G}\right)`, 'Failure probability = Φ(−mean margin / SD of margin)')],
      checks:[{label:'(a) Mean M (ft-kips)',key:'meanM'},{label:'(a) Variance M ((ft-kips)²)',key:'varM'},{label:'(b) Failure probability',key:'failureRisk'}],
      hints:['The expected value is linear even when the loads are correlated.','Do not omit the covariance term 2abρσWσP.','Define G = R−M. Failure is the normal lower tail below zero.']
    },
    q9:{
      short:'Column design',title:'Lognormal load & column sizing',lecture:'Lecture notes 7',
      intro:'Load W has mean 3000 kN and COV 0.2. Strength R has mean 35,000 kN/m² and COV 0.2.',
      question:'The load is lognormal and the applied stress is S = W/A for constant area A. For part (b), take a 0.4 m × 0.4 m square column and choose a convenient resistance distribution. For part (c), allow a crushing probability of 10⁻³.',
      tasks:['(a) Identify the distribution of applied stress.','(b) Find the probability of crushing for the 0.16 m² column.','(c) Find the required cross-sectional area for the permitted failure probability.'],
      fields:[f('meanW','Mean load W (kN)',100,1,1000000),f('covW','Load COV',.05,.001,3),f('meanR','Mean strength R (kN/m²)',1000,1,10000000),f('covR','Strength COV',.05,.001,3),f('area','Column area (m²)',.01,.0001,100),f('target','Permitted failure probability',.0001,.000001,.49)],
      note:'Following the worked solution, assume independent lognormal resistance and load.',
      results:(v,o)=>[r('(a) Stress distribution','Lognormal'),r('Mean stress',n(o.meanS),'kN/m²'),r('Stress COV',n(o.covS)),r('(b) Crushing probability',n(o.failureRisk)),r('(c) Minimum required area',n(o.requiredArea),'m²'),r('Equivalent square side',n(o.requiredSide),'m'),r('Selected area meets target',o.failureRisk<=v.target?'Yes':'No')],
      working:(v,o)=>[m(String.raw`\mu_S=\frac{\mu_W}{A},\quad \delta_S=\delta_W`, 'Stress mean = mean load / area; stress COV = load COV'),m(String.raw`\zeta_i^2=\ln(1+\delta_i^2),\quad \lambda_i=\ln\mu_i-\tfrac12\zeta_i^2`, 'For a lognormal variable: log variance = ln(1+COV²), log mean = ln(mean) − ½ log variance'),m(String.raw`Z=\ln(R/S)\sim N\!\left(\lambda_R-\lambda_S,\sqrt{\zeta_R^2+\zeta_S^2}\right)`, 'ln(R/S) is normal with mean λR−λS and SD √(ζR²+ζS²)'),m(String.raw`P_f=P(Z<0)=\Phi\!\left(\frac{\lambda_S-\lambda_R}{\sqrt{\zeta_R^2+\zeta_S^2}}\right)`, 'Crushing probability = Φ((λS−λR)/√(ζR²+ζS²))'),m(String.raw`A_{\min}=\exp\!\left[\lambda_W-\lambda_R-\Phi^{-1}(p_{\mathrm{target}})\sqrt{\zeta_R^2+\zeta_W^2}\right]`, 'Required area = exp[λW−λR−Φ⁻¹(target)√(ζR²+ζW²)]'),t('The exact original result is 0.203672 m², corresponding to a square side of 0.451301 m. A practical dimension should be rounded upward to retain the target probability.')],
      checks:[{label:'(b) Crushing probability',key:'failureRisk'},{label:'(c) Required area (m²)',key:'requiredArea'}],
      hints:['Multiplication by a positive constant preserves a lognormal distribution and its COV.','Take logarithms of R/S. Independence lets you add log variances.','Changing area shifts the log stress mean by −ln A without changing its log variance.']
    }
  };
})();

