/**
 * Finds relatede projects based on Sørensen–Dice coefficient 
 * http://en.wikipedia.org/wiki/S%C3%B8rensen%E2%80%93Dice_coefficient
 */

// Empirically recommendations are better when I take random 1k followers.
var CAP = 1000;

module.exports = function (followers, projectsStarredByUser) {
  // first, let's figure out how many followers we need to process:
  var followersToAnalyze = Math.min(CAP, followers.length);
  var analyzeRatio = followersToAnalyze/followers.length;

  var alsoStarredProjects = Object.create(null);

  // Construct data to find how many shared stars we have with other projects:
  shuffleArray(followers)
    .slice(0, followersToAnalyze)
    .forEach(computeAlsoStarredProjects);

  // Finally map shared stars into jaccard index:
  return Object.keys(alsoStarredProjects)
    .map(computeIndex).sort(byIndex);

  function computeIndex(otherProjectName) {
    var alsoStarredInfo = alsoStarredProjects[otherProjectName];
    var sharedStarsCount = alsoStarredInfo.sharedStarsCount;
    var otherProject = alsoStarredInfo.data;
    var theirStarsCount = otherProject.watchers_count;
    var ourStarsCount = followers.length;
    var index = 100 * 2 * sharedStarsCount/(analyzeRatio * (theirStarsCount + ourStarsCount));

    return {
      index: Math.round(index),
      full_name  : otherProject.full_name,
      description: otherProject.description,
      forks_count: otherProject.forks_count,
      watchers_count: otherProject.watchers_count
    };
  }

  function byIndex(x, y) { return y.index - x.index; }

  function computeAlsoStarredProjects(user) {
    var projects = projectsStarredByUser[user];
    if (projects) projects.forEach(countAlsoStarredProjects);
  }

  function countAlsoStarredProjects(project) {
    if (!alsoStarredProjects[project.full_name]) {
      alsoStarredProjects[project.full_name] = {
        sharedStarsCount: 1,
        data: project
      };
    } else {
      alsoStarredProjects[project.full_name].sharedStarsCount += 1;
    }
  }
};

function shuffleArray (array) {
  var i, j, t;
  for (i = array.length - 1; i > 0; --i) {
    j = (Math.random() * (i + 1)) | 0; // i inclusive
    t = array[j];
    array[j] = array[i];
    array[i] = t;
  }

  return array;
}