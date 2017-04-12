# Capital
An economy simulator. [Read the manual.](https://archive.org/stream/KarlMarxCapitalVolumeIPenguinClassics/Karl%20Marx%2CCapital%20Volume%20I%20%28Penguin%20Classics%29#page/n125/mode/2up)

[See it running at janbaykara.github.io/capital/](https://janbaykara.github.io/capital/)

## For the future...

### Important fixes
- Introduce **VALUE UNITS** as a useful measure of relative wealth `Society.LabourTimeSocNec / Human.hourlyRelativeProduct`
- Better communicate (*access to*) social wealth as (*proportion of access to*) **TOTAL SOCIAL LABOUR-TIME CONGEALED**

### Multi-commodity economy: Apples & Pears
-						Hour of Labour == Hour of Labour
- SocNecAvgLabour is: [exchange-value] == [exchange-value]
- And so we find that:   [apple_A_1.5] == [apple_B_0.8]
- And also that 		 [pear_C_10] == 10 x [apples_AVG]

`Tick1:
- 99 * 1hr
- 1 * 10hr
- 109hrs spent making 100 apples.
- Soc nec labour = mean   1.09
			   	 = mode   1
			   	 = median 1
Tick 2:
- 100 * 1hr
- 100hrs spent making 100 apples.
- Soc nec labour = mean   1
			   	 = mode   1
			   	 = median 1`

Mr 10hrs can't afford to survive with his time (which is limited!) in this industry (one of many!)
- his 10hrs==1[wealth] (when others get 10[wealth] is, at best, annoying; at worst, it is existential
- SO he's gonna shift to something else, a market that DOES value his time (or he stumps for less, for philosophical reasons... or he dies)
- Exchange-Value (book A for book B, book for apple) can deviate from Value (1.5hrs of A, 1.5hrs of B, 1.2hrs of C, 1.7hrs of D).

### Interesting possibilities

#### Social Policy?
- Inheritance tax
- Income tax
- Working age laws (lower,upper)
- Fiscal laws (redistribution of food/commodities?)
- Minimum/maximum wage or prices?
- Healthcare policies?
- Education policies?
- Food/care/pension for babies and old people?

#### Institutions
- Political groups
- Families
- Genders

### UI
D3 charts for:
- population growth
- Life expectancy
- Life expectancy by wealth at death
- GDP growth
- GDP per capita
- Avg personal wealth
- Wealth by age
- Wealth by skill
- Wealth by hunger
- Productivity growth
- GINI coefficient
