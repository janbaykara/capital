/*
#Ideas: politics?
- Inheritance tax
- Income tax
- Working age laws (lower,upper)
- Fiscal laws (redistribution of food/commodities?)
- Minimum/maximum wage or prices?
- Healthcare policies?
- Education policies?
- Food/care/pension for babies and old people?

# Ideas: diversify goods?

# Ideas: institutions
- Political groups
- Families
- Genders




### Important fixes
-						Hour of Labour == Hour of Labour
- SocNecAvgLabour is: [exchange-value] == [exchange-value]
- And so we find that:   [apple_A_1.5] == [apple_B_0.8]
- And also that 		 [banana_C_10] == 10 x [apples_AVG]
- An article (*kind* of use-value)
- This needs to be more explicitly recognised.
- Where there is lacking, this function doesn't work quite as well.
- When there is surplus...

So, weighted average. The average of the times it took.

Limited demand needed.

---
# Apple workers (time taken to produce an apple)

Tick1:
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
			   	 = median 1

Mr 10hrs can't afford to survive with his time (which is limited!) in this industry (one of many!)
- his 10hrs==1[wealth] (when others get 10[wealth] is, at best, annoying; at worst, it is existential
- SO he's gonna shift to something else, a market that DOES value his time (or he stumps for less, for philosophical reasons... or he dies)

- You are less productive than average. You get LESS value in exchanges for other things. You need to get better, or cheat.
----avg value of X----
+ You are more productive than average. You get MORE value in exchange for other things. You could be lazier...

---

- Exchange-Value (book A for book B, book for apple) can deviate from Value (1.5hrs of A, 1.5hrs of B, 1.2hrs of C, 1.7hrs of D).

*/

// In the beginning...
for(var i = 1, x = 20; i <= x; i++) {
	var thisBaby = new Human();
	thisBaby.age = _.random(16, 75);
	Society.population.push(thisBaby);
	Society.commodities = Society.averageAge * thisBaby.ageAdult;
}
