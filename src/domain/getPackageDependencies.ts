import { PackageVersionNotFoundError } from "./errors";
import {
  NPMPackage,
  PackageGetter,
  PackageName,
  PackageVersion,
} from "./types";
import { maxSatisfying } from "semver";
import axios from "axios";

/**
 * A function which resolves the direct dependencies of a
 * package with a given name and version.
 * The function accepts a PackageGetter, which is a function resolving
 *
 * The return value is a record with the dependencies, with the value being
 * the package name of the dependency and the value being the version of the
 *  corresponding dependency.
 *
 * @param  {[string]} packageName The name of the package
 * @param  {[string]} packageVersion The version of the package
 * @param  getPackage A function which resolves the name of a package to an NPMPackage.
 * @return {[Promise<Record<string, string>>]} Map of dependencies, entries contain `packageName: packageVersion`
 */
export async function getPackageDependencies(
  packageName: PackageName,
  packageVersion: PackageVersion,
  getPackage: PackageGetter,
): Promise<Record<PackageName, Package>> {
  const npmPackage: NPMPackage = await getPackage(packageName);

  const packageForVersion = npmPackage.versions[packageVersion];
  if (!packageForVersion) {
    throw new PackageVersionNotFoundError(packageName, packageVersion);
  }

  const dependenciesWithRange = packageForVersion?.dependencies ?? {};
  const dependencies: Record<string, Package> = {};
  //TODO issue (blocking): if the dependency tree is large, this could take a while to return as it
  // is awaiting each individual dependency, a lack of caching makes this even worse
  // suggestion: map them to an array of promises and await all 'await Promise.all(dependencies)'
  for (const [dependencyName, range] of Object.entries(dependenciesWithRange)) {
    dependencies[dependencyName] = await resolveDependenciesRecursively(
      dependencyName,
      range,
    );
  }

  return dependencies;
}

//TODO issue (blocking): There is no protection against circular dependencies
// suggestion: Add a visited set to track packages already visited
async function resolveDependenciesRecursively(
  name: string,
  range: string,
): Promise<Package> {
  const npmPackage =
    await //TODO issue: Hardcoded url it prevents effective testing.
    // suggestion: This URL should be injected in or a method injected to get the package
    // npmPackageGetter.ts also has the same issue
    (
      await axios.get(`https://registry.npmjs.org/${name}`)
    ).data;

  const maxSatisfyingVersion = maxSatisfying(
    Object.keys(npmPackage.versions),
    range,
  ) as string;

  if (!npmPackage.versions[maxSatisfyingVersion]) {
    //TODO: suggestion: Add a meaningful message to the error
    // Potentially create a custom Error?
    throw new Error();
  }

  const dependencies: Record<string, Package> = {};
  for (const [name, range] of Object.entries(
    npmPackage.versions[maxSatisfyingVersion].dependencies ?? {},
  )) {
    //TODO: suggestion: Can this @ts-ignore be removed and the underlying type mismatch be fixed?
    // Can we make use of NPMPackage interface? 'await axios.get<NPMPackage>'
    // eslint-disable-next-line
    // @ts-ignore
    dependencies[name] = await resolveDependenciesRecursively(name, range);
  }

  return { version: maxSatisfyingVersion, dependencies };
}

interface Package {
  version: string;
  dependencies: Record<PackageName, Package>;
}
