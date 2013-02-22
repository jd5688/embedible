define(function() {
	var Paginator = {
			curPage : 1,
			totalRec: 0,
			limit: 20, // default
			showMore: function () {
				var endAt = this.curPage * this.limit;
				if (endAt > this.totalRec) {
					return false; // no more pages
				} else {
					return true; // show more pages
				}
			}
		};
	
	return Paginator;
});